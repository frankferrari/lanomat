class AddWheelColumnsToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :wheel_enabled, :boolean, default: false
    add_column :game_sessions, :wheel_filter_mode, :string, default: "top_x"
    add_column :game_sessions, :wheel_filter_top_count, :integer, default: 5
    add_column :game_sessions, :wheel_proportional, :boolean, default: false
    add_column :game_sessions, :wheel_spin_id, :string
    add_column :game_sessions, :wheel_start_at, :datetime
    add_column :game_sessions, :wheel_winner_id, :integer
    add_column :game_sessions, :wheel_active, :boolean, default: false

    add_foreign_key :game_sessions, :games, column: :wheel_winner_id
  end
end
