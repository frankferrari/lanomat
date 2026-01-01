class WheelsController < ApplicationController
  before_action :ensure_host

  def spin
    if Current.game_session.start_wheel_spin!
      head :ok
    else
      head :unprocessable_entity
    end
  end

  def dismiss
    Current.game_session.dismiss_wheel!
    head :ok
  end

  private

  def ensure_host
    unless current_user&.host?
      head :forbidden
    end
  end
end
