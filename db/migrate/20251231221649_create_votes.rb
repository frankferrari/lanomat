class CreateVotes < ActiveRecord::Migration[8.0]
  def change
    create_table :votes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :game, null: false, foreign_key: true
      t.integer :weight, null: false, default: 1

      t.timestamps
    end
    add_index :votes, [ :user_id, :game_id ], unique: true
  end
end
