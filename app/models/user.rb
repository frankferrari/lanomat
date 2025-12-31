class User < ApplicationRecord
  belongs_to :game_session

  enum :role, { player: 0, host: 1, moderator: 2 }

  validates :name, presence: true, uniqueness: { scope: :game_session_id, case_sensitive: false }
end
