class Tag < ApplicationRecord
  has_many :game_tags, dependent: :destroy
  has_many :games, through: :game_tags

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  # Normalize name to handle case-insensitivity
  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.strip if name.present?
  end
end
