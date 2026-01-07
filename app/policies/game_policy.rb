class GamePolicy < ApplicationPolicy
  def index?
    user.host?
  end

  def show?
    user.host?
  end

  def create?
    user.host?
  end

  def update?
    user.host?
  end

  def destroy?
    user.host?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.host?
        scope.all
      else
        scope.none
      end
    end
  end
end
