class CreateGameSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :game_sessions do |t|
      t.string :code

      t.timestamps
    end
    add_index :game_sessions, :code, unique: true
  end
end
