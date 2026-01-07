# Turbo Architecture: The "Global vs. Local" Rule Set

This guide defines the coding standards for implementing real-time features in this application. 
**Goal**: Prevent crashes, ensure data consistency, and preserve user UI state.

---

## 🏗 rule 1: The Context Dichotomy

Determine effectively where your code runs before you write it.

| Feature Type | Execution Context | `current_user` Access | Safe to use... |
| :--- | :--- | :--- | :--- |
| **User Action** (Click, Form Submit) | **Local (Request/Response)** | ✅ Available | `turbo-frame`, Standard Controller Actions |
| **Real-Time Update** (Score Change) | **Global (Background Job)** | ❌ **FORBIDDEN** (Will Crash) | `turbo-stream` Broadcasts |

**The Golden Rule**: 
> "If it is broadcasted to 'everyone', it cannot contain logic about 'someone'."

---

## 🔪 Rule 2: Surgical Updates over Nuclear Replacement

When updating a Global value (like a score) that lives inside a Local container (like a User's Voted Card):

1.  **Do NOT use `replace`**: It destroys the container, resetting local states (input focus, "active" classes, animation state).
2.  **MUST use `update`**: Target a specific child element and change only its text/content.
3.  **Isolation**: Isolate the dynamic global value in its own DOM element with a specific ID.

**Example Pattern:**
```erb
<!-- View -->
<div class="user-card <%= 'active' if voted? %>"> <!-- LOCAL STATE (Class) -->
  <span id="score_<%= id %>"> <!-- GLOBAL TARGET (ID) -->
    <%= score %>
  </span>
</div>
```

```ruby
# Model Broadcast
Turbo::StreamsChannel.broadcast_update_to "games", target: "score_#{id}", html: new_score
```

---

## 🆔 Rule 3: ID Sanctity

Turbo is blind without IDs. It navigates the DOM exclusively by `id="..."`.

1.  **Uniqueness**: A DOM ID must be unique on the entire page.
2.  **Granularity**: If you need to update it separately, it needs its own ID.
    *   *Bad*: `<div id="game_1">...score...</div>` (Can only replace whole game)
    *   *Good*: `<span id="game_1_score">...</span>` (Can update just the score)
3.  **Standardization**: Use `dom_id(record, :context)`.
    *   Example: `dom_id(game, :score_grid)` -> `score_grid_game_1`

---

## 🐛 Rule 4: Debugging Protocol

When a Real-Time feature fails silently:

1.  **Check the Logs**: Look for `ActionView::Template::Error`.
    *   *Common Cause*: Accessing `current_user`, `session`, or `cookies` in a partial rendering from a Background Job.
2.  **Verify the Channel**: Ensure the view has `<%= turbo_stream_from "channel_name" %>`.
3.  **Verify the Target**: Inspect the DOM. Does the ID you are targeting actually exist *exactly* as spelled?

---

## 🎓 Summary Checklist for PRs

- [ ] Does this broadcast render `current_user`? -> **REJECT** (Crash Risk)
- [ ] Does this broadcast `replace` a component that holds user state (colors, inputs)? -> **REJECT** (UI Reset Risk)
- [ ] Are we using `update` to change only the necessary data? -> **APPROVE**
