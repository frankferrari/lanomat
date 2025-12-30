class CreateGames < ActiveRecord::Migration[8.0]
  def change
    create_table :games do |t|
      t.string :name, null: false
      t.string :genre
      t.string :price
      t.integer :max_players
      t.integer :votes, default: 0, null: false

      t.timestamps
    end
  end
end
