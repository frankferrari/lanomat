class GameSession < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :games, dependent: :destroy

  belongs_to :previous_game, class_name: "Game", optional: true

  validates :code, presence: true, uniqueness: true

  validates :bonus_votes, numericality: { greater_than_or_equal_to: 0 }
  validates :previous_game_penalty, numericality: { greater_than_or_equal_to: 0 }

  before_validation :set_defaults, on: :create
  before_validation :generate_code, on: :create

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

  private

  def set_defaults
    self.bonus_votes ||= 2
    self.previous_game_penalty ||= 2
    self.enable_bonus_votes = true if enable_bonus_votes.nil?
    self.punish_previous_game_tags = true if punish_previous_game_tags.nil?
    self.exclude_previous_game = false if exclude_previous_game.nil?
    self.voting_countdown_duration_minutes ||= 5
    self.voting_countdown_enabled = false if voting_countdown_enabled.nil?
  end

  def generate_code
    self.code ||= SecureRandom.alphanumeric(5).upcase
  end
end
