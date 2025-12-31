# Views Restructuring Proposal

## Current State Analysis

### Current Structure
```
app/views/
├── games/
│   ├── dashboard.html.erb          # Management view (7505 bytes, 107 lines)
│   └── manage/                     # Manage-related partials
│       ├── _form.html.erb          # New game form
│       ├── _index.html.erb         # (unused, 4948 bytes)
│       ├── _tags.html.erb          # Tag picker overlay
│       └── _tags_list.html.erb     # Tag checkboxes
├── votes/
│   ├── index.html.erb              # Voting view main page
│   └── _card.html.erb              # Individual game card
├── shared/
│   └── _footer.html.erb            # Sticky footer with stats
└── layouts/
    ├── application.html.erb
    └── mailer.html.erb
```

### Issues with Current Organization

1. **Naming Confusion**
   - `dashboard.html.erb` suggests a general dashboard, but it's actually the game management view
   - `games/manage/_index.html.erb` appears to be unused/orphaned (needs verification)
   - Partial names don't clearly indicate their purpose

2. **Mixed Concerns**
   - Tag-related partials (`_tags.html.erb`, `_tags_list.html.erb`) are in `games/manage/` but handle both new game form AND existing game editing
   - Footer shows global stats but lives in `shared/` when it could be more specific

3. **Unclear Separation**
   - All management partials are in `manage/` subdirectory
   - No subdirectory for voting partials (only one partial, but future expansion may add more)
   - No clear hierarchy for reusable components vs. page-specific partials

4. **Missing Opportunities for Clarity**
   - Header navigation is duplicated in both main views
   - Common UI patterns (forms, inputs, buttons) not extracted
   - Tag picker is complex but not clearly modular

---

## Proposed Restructuring

### New Structure
```
app/views/
├── games/
│   ├── management.html.erb         # Renamed from dashboard.html.erb
│   ├── _new_game_form.html.erb     # Moved and renamed from manage/_form.html.erb
│   ├── _game_table_row.html.erb    # NEW: Extracted from management.html.erb
│   └── _header.html.erb            # NEW: Shared navigation header
│
├── votes/
│   ├── index.html.erb              # Main voting page
│   ├── _game_card.html.erb         # Renamed from _card.html.erb
│   └── _tag_filters.html.erb       # NEW: Extracted from index.html.erb
│
├── tags/
│   ├── _picker.html.erb            # Moved from games/manage/_tags.html.erb
│   └── _checkbox_list.html.erb     # Moved from games/manage/_tags_list.html.erb
│
├── shared/
│   ├── _footer.html.erb            # Keep as-is
│   └── _editable_field.html.erb    # NEW: Reusable auto-submit input
│
└── layouts/
    ├── application.html.erb
    └── mailer.html.erb
```

---

## Rationale & Benefits

### 1. **Clearer Naming**
- ✅ `management.html.erb` clearly indicates this is the management interface
- ✅ `_new_game_form.html.erb` is descriptive and stands on its own
- ✅ `_game_card.html.erb` is more explicit than `_card.html.erb`
- ✅ Tag-related views in dedicated `tags/` directory signals reusability

### 2. **Better Organization**
- ✅ **Top-level feature separation**: `games/` vs `votes/` vs `tags/`
- ✅ **Components by domain**: Tags get their own namespace since they're used across multiple contexts
- ✅ **Flatter structure**: Removed nested `manage/` directory since all game views are management-related anyway

### 3. **Improved Modularity**
- ✅ Extract `_game_table_row.html.erb` to simplify the main management view
- ✅ Extract `_tag_filters.html.erb` to declutter voting index
- ✅ Extract `_header.html.erb` to eliminate duplication between views
- ✅ Create `_editable_field.html.erb` helper for consistent auto-submit inputs

### 4. **Scalability**
- ✅ Easy to add more voting-related partials to `votes/` directory
- ✅ Tag components are isolated and can be reused anywhere
- ✅ Shared components have a clear home in `shared/`
- ✅ Naming convention makes it obvious where new partials should go

---

## Detailed Breakdown

### Tags Directory (`tags/`)
**Why separate?**
- Tag picker is used in both new game form AND game table rows
- Self-contained overlay with complex logic
- Reusable across the application

**Files:**
- `_picker.html.erb` - The full overlay modal
- `_checkbox_list.html.erb` - Just the tag checkboxes (used within picker)

### Games Directory (`games/`)
**Simplified structure:**
- Main view: `management.html.erb` (one page, one purpose)
- Form for creating: `_new_game_form.html.erb`
- Table row for editing: `_game_table_row.html.erb`
- Shared header: `_header.html.erb`

### Votes Directory (`votes/`)
**Clean separation:**
- Main view: `index.html.erb`
- Game display: `_game_card.html.erb` (clearer than `_card.html.erb`)
- Filters: `_tag_filters.html.erb` (extracted for clarity)

### Shared Directory (`shared/`)
**Truly reusable components:**
- `_footer.html.erb` - Global stats footer
- `_editable_field.html.erb` - Auto-submit input wrapper (DRY principle)

---

## Migration Steps

### Step 1: Clean Up
1. ✅ Verify `games/manage/_index.html.erb` is unused, then delete
2. ✅ Remove `games/manage/` directory after moving files

### Step 2: Rename & Move Main Views
1. ✅ Rename `games/dashboard.html.erb` → `games/management.html.erb`
2. ✅ Update route helper to `management_games_path` (optional, for consistency)

### Step 3: Reorganize Partials
1. ✅ Move `games/manage/_form.html.erb` → `games/_new_game_form.html.erb`
2. ✅ Move `games/manage/_tags.html.erb` → `tags/_picker.html.erb`
3. ✅ Move `games/manage/_tags_list.html.erb` → `tags/_checkbox_list.html.erb`
4. ✅ Rename `votes/_card.html.erb` → `votes/_game_card.html.erb`

### Step 4: Extract New Partials
1. ✅ Extract header from both views → `games/_header.html.erb`
2. ✅ Extract table row logic → `games/_game_table_row.html.erb`
3. ✅ Extract tag filters → `votes/_tag_filters.html.erb`
4. ✅ Create reusable editable field → `shared/_editable_field.html.erb`

### Step 5: Update All References
1. ✅ Update `render` calls throughout codebase
2. ✅ Update controller actions if route names change
3. ✅ Test all views to ensure nothing broke

---

## Alternative: Minimal Restructuring

If you prefer a lighter touch, here's a minimal version:

### Minimal Changes
```
app/views/
├── games/
│   ├── management.html.erb         # Renamed from dashboard.html.erb
│   ├── _form.html.erb              # Moved from manage/_form.html.erb
│   ├── _tag_picker.html.erb        # Moved from manage/_tags.html.erb
│   └── _tag_list.html.erb          # Moved from manage/_tags_list.html.erb
│
└── votes/
    ├── index.html.erb
    └── _game_card.html.erb         # Renamed from _card.html.erb
```

**Benefits:**
- ✅ Removes confusing `manage/` subdirectory
- ✅ Renames main view for clarity
- ✅ Makes `_game_card.html.erb` more descriptive
- ✅ Tag partials get clearer names

**Trade-offs:**
- ⚠️ Doesn't extract header duplication
- ⚠️ Doesn't separate tags into their own namespace
- ⚠️ Doesn't create reusable components

---

## Recommendation

**I recommend the full restructuring** for these reasons:

1. **Investment now, clarity forever** - The codebase is still small enough to refactor easily
2. **Sets good patterns** - Future developers will understand where things go
3. **Eliminates duplication** - Shared header means one place to update navigation
4. **Better testing** - Isolated components are easier to test
5. **Easier onboarding** - New team members can navigate the structure intuitively

The minimal restructuring is a good fallback if time is limited, but doesn't solve the deeper organizational issues.

---

## Questions to Consider

1. **Route naming**: Should `dashboard_games_path` become `management_games_path`?
2. **Unused file**: Is `games/manage/_index.html.erb` actually unused? Should we delete it?
3. **Header extraction**: Do you want the navigation to be in a partial, or keep it inline?
4. **Tag namespace**: Should tags get their own directory, or stay under `games/`?

Let me know which approach you'd like to take, and I can implement it!
