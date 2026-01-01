class GameSession < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :games, dependent: :destroy

  belongs_to :previous_game, class_name: "Game", optional: true
  belongs_to :wheel_winner, class_name: "Game", optional: true

  validates :code, presence: true, uniqueness: true

  validates :bonus_votes, numericality: { greater_than_or_equal_to: 0 }
  validates :previous_game_penalty, numericality: { greater_than_or_equal_to: 0 }
  validates :wheel_filter_top_count, numericality: { greater_than_or_equal_to: 2 }, allow_nil: true

  before_validation :set_defaults, on: :create
  before_validation :generate_code, on: :create

  # Countdown methods
  def start_countdown!
    return unless voting_countdown_enabled?

    if voting_countdown_paused_seconds.present?
      # Resume from pause
      update!(
        voting_countdown_ends_at: Time.current + voting_countdown_paused_seconds.seconds,
        voting_countdown_paused_seconds: nil
      )
    else
      # Fresh start
      update!(voting_countdown_ends_at: Time.current + voting_countdown_duration_minutes.minutes)
    end

    broadcast_countdown_update
  end

  def pause_countdown!
    return unless voting_countdown_enabled? && voting_countdown_ends_at.present?

    update!(
      voting_countdown_paused_seconds: seconds_remaining,
      voting_countdown_ends_at: nil
    )
    broadcast_countdown_update
  end

  def stop_countdown!
    update!(
      voting_countdown_ends_at: nil,
      voting_countdown_paused_seconds: nil
    )
    broadcast_countdown_update
  end

  def voting_closed?
    return false unless voting_countdown_enabled?

    # If it was started and hasn't ended yet
    if voting_countdown_ends_at.present?
      return Time.current > voting_countdown_ends_at
    end

    # If it was paused, it's not closed yet (unless it was already at 0)
    if voting_countdown_paused_seconds.present?
      return voting_countdown_paused_seconds <= 0
    end

    false
  end

  def seconds_remaining
    return 0 unless voting_countdown_enabled?

    if voting_countdown_ends_at.present?
      return [ 0, (voting_countdown_ends_at - Time.current).to_i ].max
    end

    if voting_countdown_paused_seconds.present?
      return voting_countdown_paused_seconds
    end

    voting_countdown_duration_minutes.minutes.to_i
  end

  def countdown_active?
    voting_countdown_ends_at.present?
  end

  def countdown_paused?
    voting_countdown_paused_seconds.present?
  end

  def broadcast_countdown_update
    broadcast_replace_to "games", target: "countdown_badge", partial: "votes/countdown_badge", locals: { game_session: self }
  end

  def broadcast_settings_update
    # Broadcast to both grid and list view targets
    broadcast_replace_to "games", target: "settings_cards_grid", partial: "votes/settings_cards", locals: { vertical: false }
    broadcast_replace_to "games", target: "settings_cards_vertical", partial: "votes/settings_cards", locals: { vertical: true }
  end

  # Wheel of Fortune methods
  def eligible_wheel_games
    scope = games.order(votes_score: :desc, name: :asc)

    case wheel_filter_mode
    when "top_x"
      # Get top N games with positive votes
      scope.where("votes_score > 0").limit(wheel_filter_top_count)
    when "all"
      scope
    when "winners"
      # Get all games tied for first place
      max_score = scope.maximum(:votes_score)
      scope.where(votes_score: max_score)
    else
      scope.limit(5)
    end
  end

  def wheel_can_spin?
    wheel_enabled? && eligible_wheel_games.count >= 2 && !wheel_active?
  end

  def start_wheel_spin!
    eligible = eligible_wheel_games.to_a
    return false if eligible.count < 2

    # Pick random winner
    winner = eligible.sample

    # Set spin state with 5 second countdown
    update!(
      wheel_spin_id: SecureRandom.uuid,
      wheel_start_at: Time.current + 5.seconds,
      wheel_winner_id: winner.id,
      wheel_active: true
    )

    broadcast_wheel_update
    true
  end

  def dismiss_wheel!
    update!(
      wheel_spin_id: nil,
      wheel_start_at: nil,
      wheel_winner_id: nil,
      wheel_active: false
    )

    broadcast_wheel_dismiss
  end

  def wheel_games_data
    eligible_wheel_games.map do |game|
      {
        id: game.id,
        name: game.name,
        votes: game.votes_score
      }
    end
  end

  def broadcast_wheel_update
    broadcast_replace_to "games", target: "wheel_container", partial: "wheel/overlay", locals: {
      game_session: self,
      games: wheel_games_data,
      proportional: wheel_proportional?,
      start_at: wheel_start_at,
      winner_id: wheel_winner_id,
      spin_id: wheel_spin_id
    }
  end

  def broadcast_wheel_dismiss
    broadcast_replace_to "games", target: "wheel_container", partial: "wheel/empty"
  end

  private

  def set_defaults
    self.bonus_votes ||= 2
    self.previous_game_penalty ||= 2
    self.enable_bonus_votes = true if enable_bonus_votes.nil?
    self.punish_previous_game_tags = true if punish_previous_game_tags.nil?
    self.exclude_previous_game = false if exclude_previous_game.nil?
    self.voting_countdown_duration_minutes ||= 5
    self.voting_countdown_enabled = false if voting_countdown_enabled.nil?
    self.wheel_enabled = false if wheel_enabled.nil?
    self.wheel_filter_mode ||= "top_x"
    self.wheel_filter_top_count ||= 5
    self.wheel_proportional = false if wheel_proportional.nil?
  end

  def generate_code
    self.code ||= SecureRandom.alphanumeric(5).upcase
  end
end
