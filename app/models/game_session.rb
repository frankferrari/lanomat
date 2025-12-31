class GameSession < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :games, dependent: :destroy

  validates :code, presence: true, uniqueness: true

  before_validation :generate_code, on: :create

  private

  def generate_code
    self.code ||= SecureRandom.alphanumeric(5).upcase
  end
end
