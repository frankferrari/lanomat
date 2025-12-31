class Vote < ApplicationRecord
  belongs_to :user
  belongs_to :game

  validates :user_id, uniqueness: { scope: :game_id, message: "can only vote once per game" }
  validates :weight, numericality: { greater_than: 0 }

  after_save :update_game_score
  after_destroy :update_game_score

  private

  def update_game_score
    game.update(votes_score: game.votes.sum(:weight))
  end
end
