# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_31_234714) do
  create_table "game_sessions", force: :cascade do |t|
    t.string "code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "bonus_votes"
    t.integer "previous_game_id"
    t.integer "previous_game_penalty", default: 2
    t.boolean "enable_bonus_votes", default: false
    t.boolean "punish_previous_game_tags", default: false
    t.index ["code"], name: "index_game_sessions_on_code", unique: true
    t.index ["previous_game_id"], name: "index_game_sessions_on_previous_game_id"
  end

  create_table "game_tags", force: :cascade do |t|
    t.integer "game_id", null: false
    t.integer "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id", "tag_id"], name: "index_game_tags_on_game_id_and_tag_id", unique: true
    t.index ["game_id"], name: "index_game_tags_on_game_id"
    t.index ["tag_id"], name: "index_game_tags_on_tag_id"
  end

  create_table "games", force: :cascade do |t|
    t.string "name", null: false
    t.string "price"
    t.integer "max_players"
    t.integer "votes_score", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "game_session_id", null: false
    t.index ["game_session_id"], name: "index_games_on_game_session_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.integer "role"
    t.integer "game_session_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_session_id"], name: "index_users_on_game_session_id"
  end

  create_table "votes", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "game_id", null: false
    t.integer "weight", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_votes_on_game_id"
    t.index ["user_id", "game_id"], name: "index_votes_on_user_id_and_game_id", unique: true
    t.index ["user_id"], name: "index_votes_on_user_id"
  end

  add_foreign_key "game_sessions", "games", column: "previous_game_id"
  add_foreign_key "game_tags", "games"
  add_foreign_key "game_tags", "tags"
  add_foreign_key "games", "game_sessions"
  add_foreign_key "users", "game_sessions"
  add_foreign_key "votes", "games"
  add_foreign_key "votes", "users"
end
