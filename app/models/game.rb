class Game < ApplicationRecord
  after_commit :broadcast_wheel_data

  validates :name, presence: true

  broadcasts_to ->(game) { "games" }, inserts_by: :prepend, target: "games_grid"
  private

  def broadcast_wheel_data
    # Broadcast to the games_wheel_data stream with the full list of games
    # We use a lambda or just perform the broadcast
    # Using specific target "wheel_data_source"
    Turbo::StreamsChannel.broadcast_replace_to(
      "games_wheel_data",
      target: "wheel_data_source",
      partial: "games/wheel_data",
      locals: { games: Game.order(votes: :desc, name: :asc) }
    )
  end
end
