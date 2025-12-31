class GameTag < ApplicationRecord
  belongs_to :game
  belongs_to :tag

  validates :game_id, uniqueness: { scope: :tag_id, message: "already has this tag" }

  # Clean up orphaned tags after destroying a game-tag association
  after_destroy :cleanup_orphaned_tag

  private

  def cleanup_orphaned_tag
    # Delete the tag if it has no more games associated with it
    tag.destroy if tag.game_tags.empty?
  end
end
