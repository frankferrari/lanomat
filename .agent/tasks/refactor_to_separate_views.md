# Refactor to Approach B: Separate Voting and Games Dashboard

## Goal
Split the current single-page tab approach into two dedicated views:
- `/votes` - Voting dashboard (read-only, interactive voting)
- `/games/dashboard` - Games management dashboard (CRUD operations)

## Tasks

- [ ] Create VotesController with index and vote actions
- [ ] Create votes/index.html.erb view
- [ ] Refactor GamesController to focus on CRUD (add dashboard action)
- [ ] Create games/dashboard.html.erb view
- [ ] Update routes to new structure
- [ ] Move and organize partials appropriately
- [ ] Update navigation links between views
- [ ] Ensure Turbo Streams work on both views
- [ ] Test voting functionality
- [ ] Test CRUD functionality
- [ ] Update reset action to work from both views

## Key Changes

### Controllers
- `VotesController` - handles voting display and vote actions
- `GamesController` - handles CRUD operations and dashboard view

### Routes
- `/votes` → `votes#index`
- `/votes/:id/vote` → `votes#vote`
- `/votes/reset` → `votes#reset`
- `/games/dashboard` → `games#dashboard`
- `/games` → standard CRUD

### Views
- `votes/index.html.erb` - main voting page with filters, grid/list toggle
- `games/dashboard.html.erb` - main management page with table, form
