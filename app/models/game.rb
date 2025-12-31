class Game < ApplicationRecord
  has_many :game_tags, dependent: :destroy
  has_many :tags, through: :game_tags

  validates :name, presence: true

  broadcasts_to ->(game) { "games" }, inserts_by: :prepend, target: "games_grid"
end
