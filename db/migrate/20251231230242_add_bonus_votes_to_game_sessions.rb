class AddBonusVotesToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :bonus_votes, :integer
  end
end
