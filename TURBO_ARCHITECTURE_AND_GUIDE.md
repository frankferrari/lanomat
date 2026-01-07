# Turbo Architecture & Implementation Guide
## Application: Lan-o-mat

This document provides a comprehensive digest of the Turbo Streams and Frames implementation within the codebase. It maps the hierarchy, interactions, and structure, serving as both a technical documentation and a teaching aid for developers.

### 1. High-Level Architecture
The application leverages **Hotwire** (Turbo + Stimulus) to create a reactive, SPA-like experience without complex client-side state management.

- **Global Sync (`Turbo Streams`)**: Used for "multiplayer" shared state (Scores, Countdown Timer, Wheel of Fortune).
- **Local Scope (`Turbo Frames`)**: Used for navigation within the voting interface (Filtering tags, switching views) without reloading the global header/footer.
- **Backend (`Solid Cable`)**: Handles the WebSocket transport for broadcasts in production, backed by the database.

---

### 2. DOM Hierarchy & Structure

#### The "votes_view" Frame
The core of the interaction lives in `app/views/votes/index.html.erb`.

```html
<main>
  <!-- The Prison: Navigation inside here stays here -->
  <turbo-frame id="votes_view" data-controller="view-mode" ...>
      
      <!-- Controls -->
      <a href="/votes?view=grid" data-turbo-action="replace">...</a>
      
      <!-- Filters -->
      <a href="/votes?tag=fps" data-turbo-action="replace">...</a>

      <!-- Content -->
      <div id="games_grid">...</div>
  </turbo-frame>
</main>
```

- **Scope**: The `id="votes_view"` frame wraps the entire content area (Title, Controls, Grid/List).
- **Navigation**: Links for Tags and View Modes are inside this frame. When clicked, Turbo requests the new HTML, extracts the `<turbo-frame id="votes_view">` from the response, and swaps *only* that content.
- **URL Handling**: The `data: { turbo_action: "replace" }` attribute on these links ensures that even though we only updated the frame, the **Browser URL** helps (e.g. `?tag=FPS`) matches the state. This allows users to refresh the page and keep their filter.

#### Global Broadcast Receivers
Messages are received via a channel subscription defined in the view:
```erb
<!-- app/views/votes/index.html.erb -->
<%= turbo_stream_from "games" %> 
```
This single line subscribes the user to the `games` stream. Updates broadcast to this stream will scan the ENTIRE page for matching IDs, regardless of which Frame they are in.

---

### 3. Implementation Patterns

#### A. Turbo Streams (Real-Time State)

**Mechanism**: The server pushes HTML snippets to all connected clients.
**Key Rule**: *State Isolation*. Broadcasts happen in background jobs. They have NO access to `current_user` or the `session`.

**Example: Live Score Updates** (`app/models/vote.rb`)
The code follows the **Surgical Precision** rule perfectly. Instead of replacing the entire Game Card, it updates *only* the score number.

```ruby
def broadcast_game_update
  # 1. Surgical Precision: target specific score elements
  # 2. Granular IDs: dom_id(game, :score_grid) -> "score_grid_game_12"
  Turbo::StreamsChannel.broadcast_update_to(
    "games",
    target: ActionView::RecordIdentifier.dom_id(game, :score_grid), 
    html: game.votes_score.to_s, # Only sending the number!
  )
end
```
**Why this is good**: If a user is hovering over a card (triggering a CSS hover state), replacing the whole card would reset that hover. Updating just the *text content* of the number preserves the user's cursor state and animation frame.

**Example: Countdown Timer** (`app/models/game_session.rb`)
```ruby
def broadcast_countdown_update
  broadcast_replace_to "games", target: "countdown_badge", partial: "votes/countdown_badge", ...
end
```
Here, `replace` is used. This completely destroys the old badge and inserts the new one.
* **Trade-off**: `replace` is easier to implement (just render the partial), but heavier on the DOM than `update`. For a countdown that updates every minute or on state change, this is acceptable.

#### B. Turbo Frames (Scoped Context)

**Mechanism**: Decomposes the page into independent contexts.
**Key Rule**: *The Prison Rule*.

In `app/views/players/index.html.erb` (implied from controller), rows are wrapped in frames:
```erb
<%= turbo_frame_tag user do %>
  <!-- Edit form or Display row -->
<% end %>
```
When `PlayersController` updates a user, it doesn't need to redirect. It renders a stream to replace *just* that row (`turbo_stream.replace(@user, ...)`).

---

### 4. Critical Flaws & Teaching Moments

#### ⚠️ 1. Controller Response Status (Optimization vs Rule)
**File**: `app/controllers/settings_controller.rb`
**The Code**:
```ruby
format.turbo_stream { head :ok }
format.html { redirect_to ... }
```
**The Lesson**: The "303 Rule" (Redirect after submit) is critical for **HTML** responses to prevent form re-submission interaction issues.
*   Here, `format.html` correctly redirects.
*   `format.turbo_stream` returns `head :ok`. This is **valid** because the side-effects (updating the UI) are handled by the *Model Broadcast* (`Current.game_session.broadcast_settings_update`). The client simply needs to know "it worked".
*   *Note*: If you rely on the response to update the UI (instead of broadcasts), you would render a stream/frame here.

#### ✅ 2. Idempotent GETs (Caching)
**Files**: `VotesController`, `GamesController`
**Status**: **PASSED**.
The `index` actions are purely read-only. Turbo Drive can safely cache these pages. When a user navigates "Back", Turbo restores the snapshot instantly without side effects.

#### ✅ 3. Granular IDs
**File**: `app/models/vote.rb`
**Status**: **PASSED**.
Using `dom_id(game, :score_grid)` ensures uniqueness.
*   `game_15` (The Card)
*   `score_grid_game_15` (The Score inside the card)
This prevents "Element ID collisions" which would cause Turbo to update the wrong element or the first one it finds.

---

### 5. Interaction with Solid Cable

**Configuration**: `config/cable.yml`
**Adapter**: `solid_cable` (Production)

Solid Cable stores broadcast messages in the Database (SQL).
1.  **Vote Created**: `Vote` model triggers `broadcast_update_to`.
2.  **Storage**: Rails writes the HTML payload to the `solid_cable_messages` table.
3.  **worker**: A background worker (Solid Cable) polls/listens for these inserts.
4.  **Distribution**: The worker pushes the message to connected WebSockets.

**Implication for Devs**:
*   Because it uses the DB, **transactional integrity** matters. If a transaction rolls back, the broadcast might still have been queued if not carefully handled (though Rails callbacks usually handle `after_commit`).
*   **Performance**: It adds DB load. Ensure `solid_cable` tables are optimized if voting volume becomes massive (millions of concurrent votes).

### Summary for Junior Devs

1.  **Frames are for Navigation**: Use them to keep the footer/header static while the user clicks around the voting list.
2.  **Streams are for Live Data**: Use them to push updates (scores changing) to *everyone* instantly.
3.  **IDs Matter**: Never hardcode `id="score"`. Always use dynamic IDs `id="<%= dom_id(game) %>"` so Turbo knows exactly what to touch.
4.  **No `current_user` in Broadcasts**: Background jobs don't know who is logged in. Broadcast "Game X changed", not "You updated Game X".
