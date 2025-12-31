class Game < ApplicationRecord
  belongs_to :game_session
  has_many :game_tags, dependent: :destroy
  has_many :tags, through: :game_tags
  has_many :votes, dependent: :destroy

  validates :name, presence: true


  broadcasts_to ->(game) { "games" }, inserts_by: :prepend, target: "games_grid"

  def tag_names=(names)
    self.tags = names.map do |name|
      Tag.where("LOWER(name) = ?", name.strip.downcase).first_or_create!(name: name.strip)
    end
  end
end
