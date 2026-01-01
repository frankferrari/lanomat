class SettingsController < ApplicationController
  def update
    authorize Current.game_session

    if Current.game_session.update(settings_params)
      # Recalculate scores for all games as settings might have changed penalties or bonuses
      Current.game_session.games.find_each(&:update_score!)
      redirect_to votes_path(view: params[:view]), notice: "Settings updated successfully."
    else
      redirect_to votes_path(view: params[:view]), alert: "Failed to update settings."
    end
  end

  private

  def settings_params
    params.require(:game_session).permit(:bonus_votes, :votes_per_game, :punish_previous_game_tags, :previous_game_id, :previous_game_penalty, :enable_bonus_votes, :exclude_previous_game, :voting_countdown_enabled, :voting_countdown_duration_minutes)
  end
end
