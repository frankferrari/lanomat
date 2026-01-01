class AddPauseStopToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :voting_countdown_ends_at, :datetime
    add_column :game_sessions, :voting_countdown_paused_seconds, :integer
  end
end
