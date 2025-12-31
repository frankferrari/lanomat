class GameSession < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :games, dependent: :destroy

  validates :code, presence: true, uniqueness: true

  validates :bonus_votes, numericality: { greater_than_or_equal_to: 0 }

  before_validation :set_defaults, on: :create
  before_validation :generate_code, on: :create

  private

  def set_defaults
    self.bonus_votes ||= 0
  end

  def generate_code
    self.code ||= SecureRandom.alphanumeric(5).upcase
  end
end
