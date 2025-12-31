class AddPunishPreviousGameTagsToGameSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :game_sessions, :punish_previous_game_tags, :boolean, default: false
  end
end
