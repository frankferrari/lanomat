class UserPolicy < ApplicationPolicy
  def index?
    user.host?
  end

  def update?
    user.host?
  end

  def destroy?
    user.host? && record != user
  end

  def promote?
    user.host?
  end

  def demote?
    user.host? && record != user
  end

  class Scope < Scope
    def resolve
      scope.where(game_session: user.game_session)
    end
  end
end
