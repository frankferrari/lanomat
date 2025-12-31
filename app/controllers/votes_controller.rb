class VotesController < ApplicationController
  def index
    scope = Current.game_session.games.includes(:tags).order(votes_score: :desc, name: :asc)

    if params[:tag].present? && params[:tag] != "All"
      scope = scope.joins(:tags).where(tags: { name: params[:tag] })
    end

    @games = scope
    @view_mode = params[:view].presence_in(%w[grid list]) || "grid"
    @voted_game_ids = current_user.votes.where(game: @games).pluck(:game_id).to_set
  end

  def vote
    @game = Current.game_session.games.find(params[:id])
    direction = params[:direction]

    existing_vote = current_user.votes.find_by(game: @game)

    if direction == "up"
      # Add vote if not already voted
      current_user.votes.create(game: @game) unless existing_vote
    else
      # Remove vote if exists
      existing_vote&.destroy
    end

    @game.reload
    @voted = current_user.voted_for?(@game)
    @view_mode = params[:view].presence_in(%w[grid list]) || "grid"

    respond_to do |format|
      format.html { redirect_to votes_path }
      format.turbo_stream
    end
  end

  def reset
    Vote.joins(:game).where(games: { game_session: Current.game_session }).destroy_all
    Current.game_session.games.update_all(votes_score: 0)

    respond_to do |format|
      format.html { redirect_to votes_path, notice: "All votes have been reset." }
      format.turbo_stream { redirect_to votes_path }
    end
  end
end
