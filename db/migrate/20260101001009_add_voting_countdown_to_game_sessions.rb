class AddVotingCountdownToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :voting_countdown_enabled, :boolean
    add_column :game_sessions, :voting_countdown_duration_minutes, :integer
    add_column :game_sessions, :voting_countdown_started_at, :datetime
  end
end
