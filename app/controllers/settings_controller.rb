class SettingsController < ApplicationController
  before_action :ensure_host

  def update
    if Current.game_session.update(settings_params)
      # Recalculate scores for all games as settings might have changed penalties or bonuses
      Current.game_session.games.find_each(&:update_score!)
      redirect_to votes_path, notice: "Settings updated successfully."
    else
      redirect_to votes_path, alert: "Failed to update settings."
    end
  end

  private

  def settings_params
    params.require(:game_session).permit(:bonus_votes, :votes_per_game, :punish_previous_game_tags, :previous_game_id, :previous_game_penalty, :enable_bonus_votes)
  end

  def ensure_host
    unless current_user&.host?
      redirect_to root_path, alert: "Only the host can access settings."
    end
  end
end
