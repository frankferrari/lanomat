class AddExcludePreviousGameToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :exclude_previous_game, :boolean
  end
end
