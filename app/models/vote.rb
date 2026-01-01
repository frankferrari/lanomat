class Vote < ApplicationRecord
  belongs_to :user
  belongs_to :game

  validates :user_id, uniqueness: { scope: :game_id, message: "can only vote once per game" }
  validates :weight, numericality: { other_than: 0 }
  validate :validate_bonus_limit

  after_save :update_game_score
  after_destroy :update_game_score

  private

  def validate_bonus_limit
    return unless user && game && game.game_session

    # Calculate total bonus votes used by the user across all their votes
    # Used bonus = (weight - 1) for each vote
    current_bonus_usage = user.votes.where.not(id: id).sum { |v| (v.weight || 1) - 1 }
    new_bonus_usage = current_bonus_usage + ((weight || 1) - 1)

    limit = game.game_session.bonus_votes || 0
    if new_bonus_usage > limit
      errors.add(:base, "You have exceeded your bonus votes limit of #{limit}")
    end
  end

  def update_game_score
    game.update_score!
    broadcast_game_update
  end

  def broadcast_game_update
    # Broadcast updates for both grid and list views to all subscribers
    # Turbo will only replace the one that exists in each user's DOM
    Turbo::StreamsChannel.broadcast_replace_to(
      "games",
      target: ActionView::RecordIdentifier.dom_id(game, :grid),
      partial: "votes/card_grid",
      locals: { game: game, voted_game_ids: Set.new }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      "games",
      target: ActionView::RecordIdentifier.dom_id(game, :list),
      partial: "votes/card_list",
      locals: { game: game, voted_game_ids: Set.new }
    )
  end
end
