class RenameVotesToVotesScoreOnGames < ActiveRecord::Migration[8.0]
  def change
    rename_column :games, :votes, :votes_score
  end
end
