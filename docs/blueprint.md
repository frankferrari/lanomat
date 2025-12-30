# Rails 8 Lan-O-Mat: AI Specification & Product Requirements

## 1. Project Context & Objectives

**Product Name:** Lan-O-Mat
**Goal:** Build a collaborative, real-time LAN party companion app that allows a group of users to democratically vote on which game to play next, or use a random "Decider" wheel to pick a winner from the top favorites.

### Core User Experience
- **Immediacy:** Users open the app and instantly see the same state as everyone else.
- **Interactivity:** Voting happens live. The wheel spins physically on the screen.
- **Aesthetics:** "Gamer Dark Mode" — deeply saturated dark grays, slate blues, and neon purple accents to match a dimly lit LAN environment.

### Tech Stack Requirements
- **Framework:** `Rails 8` (Standard "Omakase" stack).
- **Database:** `SQLite` (Production configuration).
- **Real-Time:** `Turbo Streams` broadcast over `Solid Cable` (no Redis).
- **Styling:** `Tailwind CSS`.
- **Frontend Logic:** `Stimulus.js` (for canvas animations).

---

## 2. Functional Specifications (Development Roadmap)

### Phase 1: Foundation & Data Schema
**Objective:** Establish the application shell and the primary data model.

- **App Initialization:** Create a new `Rails 8` application configured with `Tailwind CSS`.
- **Data Model (`Game`):**
    - **Attributes:**
        - `name` (String): The title of the video game.
        - `genre` (String): E.g., "FPS", "RTS", "MOBA".
        - `price` (String): Free-text field for cost (e.g., "Free", "$19.99").
        - `max_players` (Integer): The lobby size limit.
        - `votes` (Integer): The current score.
    - **Schema Constraints:**
        - The `votes` column must have a default value of `0` at the database level.
        - `name` should be required.

---

### Phase 2: Business Logic & Controller Actions
**Objective:** Implement the backend logic for manipulating game state.

- **Read (`index`):**
    - Fetch all games from the database.
    - **Sorting Requirement:** The list must be strictly ordered by `votes` in descending order. This ensures the leaderboard is always accurate.
- **Update (`vote`):**
    - Create a custom controller action to handle voting.
    - **Logic:** It should accept a parameter to determine direction (up or down).
    - **Constraint:** Votes cannot go below zero. Implement a check: `[current_votes + delta, 0].max`.
- **Bulk Update (`reset`):**
    - Create a collection action to reset the state for a new round.
    - **Logic:** Set the `votes` attribute to `0` for all `Game` records in the database simultaneously.

---

### Phase 3: UI/UX & Component Design
**Objective:** Create a polished "Dark Mode" interface using `Tailwind CSS`.

- **Game Card Component (Partial):**
    - **Container:** `bg-slate-900`, rounded corners, subtle border.
    - **Visual Logic:** If a game currently has the highest vote count (and `votes > 0`), display a conspicuous "Leading" badge (e.g., Gold/Yellow) on the card.
    - **Controls:** Include distinct "Up" and "Down" arrow buttons for voting.
    - **Metadata:** Clearly display Genre, Price, and Max Players in a secondary text color (`slate-400`).
- **Main Dashboard (`index`):**
    - **Header:** App title ("LAN-O-MAT") and a destructive "Reset Votes" button (red styling).
    - **Layout:** A responsive grid system (1 column mobile, 2 columns tablet, 3 columns desktop) for the Game Cards.
    - **Wheel Container:** A dedicated section above the game grid reserved for the `Stimulus` Canvas controller.
    - **Creation:** A simple form at the bottom of the page to add new games.

---

### Phase 4: Real-Time Reactivity (Turbo)
**Objective:** Eliminate the need for page refreshes.

- **Model Broadcasts:**
    - Implement `Turbo Stream` Broadcasts directly on the `Game` model.
    - **Events:**
        - **Create:** Prepend the new game card to the list for all users.
        - **Update:** Replace the specific game card (updating the vote count/badge) for all users.
        - **Destroy:** Remove the game card from the UI for all users.
- **Stream Channel:** Ensure the `index` view subscribes to the "games" channel via `turbo_stream_from`.

---

### Phase 5: The "Decider" Wheel (Stimulus.js)
**Objective:** A client-side canvas animation for random selection.

- **Stimulus Controller (`wheel_controller.js`):**
    - **Inputs:** Accept the list of the Top 5 Games (names only) as a data value.
    - **Drawing Logic:**
        - Render a colored pie chart on an `HTML5 Canvas`.
        - Divide the circle equally by the number of games.
        - Render text labels for each game slice, rotated to align with the center.
        - Draw a static "Pointer" (triangle) at the top of the wheel (12 o'clock position).
    - **Animation Logic (`spin` action):**
        - On click, trigger an animation loop (`requestAnimationFrame`).
        - **Physics:** Use an ease-out function (e.g., cubic or quartic) to simulate friction/slowing down.
        - **Duration:** Randomize between 3-5 seconds.
    - **Winner Calculation:**
        - Determine the winner based on the final rotation angle relative to the fixed pointer.
        - Display the winning game's name in a large, celebratory text element below the canvas.

---

### Phase 6: Deployment Configuration (Kamal)
**Objective:** Prepare for generic VPS deployment.

- **Infrastructure:** Assume a standard Linux VPS (Ubuntu/Debian).
- **Networking:** The application should be accessible via a domain name to allow automatic SSL via Let's Encrypt (handled by `Kamal Proxy`).
- **Persistence:** Ensure the `SQLite` database file is mounted to a persistent volume so data survives container restarts.