class GameSessionPolicy < ApplicationPolicy
  def update?
    user.host?
  end

  def reset?
    user.host?
  end
end
