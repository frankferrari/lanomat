class Game < ApplicationRecord
  belongs_to :game_session
  has_many :game_tags, dependent: :destroy
  has_many :tags, through: :game_tags
  has_many :votes, dependent: :destroy

  has_many :previous_sessions, class_name: "GameSession", foreign_key: "previous_game_id", dependent: :nullify
  has_many :winning_sessions, class_name: "GameSession", foreign_key: "wheel_winner_id", dependent: :nullify

  validates :name, presence: true, uniqueness: { scope: :game_session_id, case_sensitive: false }

  def tag_names=(names)
    self.tags = names.map do |name|
      Tag.where("LOWER(name) = ?", name.strip.downcase).first_or_create!(name: name.strip)
    end
  end

  def update_score!
    raw_score = votes.sum(:weight)

    penalty = 0
    if game_session.previous_game_id.present? && game_session.previous_game_penalty.to_i > 0
      # Check if this game shares any tags with the previous game
      if (tag_ids & game_session.previous_game.tag_ids).any?
        penalty = game_session.previous_game_penalty
      end
    end

    update(votes_score: raw_score - penalty)
  end
end
