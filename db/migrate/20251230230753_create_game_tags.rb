class CreateGameTags < ActiveRecord::Migration[8.0]
  def change
    create_table :game_tags do |t|
      t.references :game, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true

      t.timestamps
    end
    add_index :game_tags, [ :game_id, :tag_id ], unique: true
  end
end
