class SettingsController < ApplicationController
  before_action :ensure_host

  def show
  end

  def update
    # Placeholder for update logic
  end

  private

  def ensure_host
    unless current_user&.host?
      redirect_to root_path, alert: "Only the host can access settings."
    end
  end
end
