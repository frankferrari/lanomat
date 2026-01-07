class AddAllowDownvotesToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :allow_downvotes, :boolean, default: true
  end
end
