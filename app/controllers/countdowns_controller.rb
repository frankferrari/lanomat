class CountdownsController < ApplicationController
  before_action :ensure_host

  def create
    Current.game_session.start_countdown!
    respond_to do |format|
      format.turbo_stream { render_countdown_update }
      format.html { redirect_to votes_path }
    end
  end

  def pause
    Current.game_session.pause_countdown!
    respond_to do |format|
      format.turbo_stream { render_countdown_update }
      format.html { redirect_to votes_path }
    end
  end

  def destroy
    Current.game_session.stop_countdown!
    respond_to do |format|
      format.turbo_stream { render_countdown_update }
      format.html { redirect_to votes_path }
    end
  end

  private

  def render_countdown_update
    render turbo_stream: turbo_stream.replace(
      "countdown_badge",
      partial: "votes/countdown_badge",
      locals: { game_session: Current.game_session }
    )
  end

  def ensure_host
    unless current_user&.host?
      head :forbidden
    end
  end
end
