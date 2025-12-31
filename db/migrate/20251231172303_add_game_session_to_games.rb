class AddGameSessionToGames < ActiveRecord::Migration[8.0]
  def change
    add_reference :games, :game_session, null: false, foreign_key: true
  end
end
