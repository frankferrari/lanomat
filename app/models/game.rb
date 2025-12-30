class Game < ApplicationRecord
  validates :name, presence: true

  broadcasts_to ->(game) { "games" }, inserts_by: :prepend, target: "games_grid"
end
