class Current < ActiveSupport::CurrentAttributes
  attribute :user
  attribute :game_session

  delegate :host?, :player?, :moderator?, to: :user, allow_nil: true
end
