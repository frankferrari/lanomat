class SettingsController < ApplicationController
  before_action :ensure_host

  def update
    if Current.game_session.update(settings_params)
      redirect_to votes_path, notice: "Settings updated successfully."
    else
      redirect_to votes_path, alert: "Failed to update settings."
    end
  end

  private

  def settings_params
    params.require(:game_session).permit(:bonus_votes)
  end

  def ensure_host
    unless current_user&.host?
      redirect_to root_path, alert: "Only the host can access settings."
    end
  end
end
