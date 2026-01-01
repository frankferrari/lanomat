class GameSession < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :games, dependent: :destroy

  belongs_to :previous_game, class_name: "Game", optional: true

  validates :code, presence: true, uniqueness: true

  validates :bonus_votes, numericality: { greater_than_or_equal_to: 0 }
  validates :previous_game_penalty, numericality: { greater_than_or_equal_to: 0 }

  before_validation :set_defaults, on: :create
  before_validation :generate_code, on: :create

  private

  def set_defaults
    self.bonus_votes ||= 2
    self.previous_game_penalty ||= 2
    self.enable_bonus_votes = true if enable_bonus_votes.nil?
    self.punish_previous_game_tags = true if punish_previous_game_tags.nil?
    self.exclude_previous_game = false if exclude_previous_game.nil?
  end

  def generate_code
    self.code ||= SecureRandom.alphanumeric(5).upcase
  end
end
