class AddBlockSettingsToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_reference :game_sessions, :previous_game, null: true, foreign_key: { to_table: :games }
    add_column :game_sessions, :previous_game_penalty, :integer, default: 2
    add_column :game_sessions, :enable_bonus_votes, :boolean, default: false
  end
end
