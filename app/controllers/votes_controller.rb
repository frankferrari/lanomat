class VotesController < ApplicationController
  def index
    # Base query for voting view
    scope = Game.includes(:tags).order(votes: :desc, name: :asc)

    # Filter by tag if present
    if params[:tag].present? && params[:tag] != "All"
      scope = scope.joins(:tags).where(tags: { name: params[:tag] })
    end

    @games = scope
  end

  def vote
    @game = Game.find(params[:id])
    direction = params[:direction] == "down" ? -1 : 1

    # Ensure votes don't go below 0
    new_votes = [ @game.votes + direction, 0 ].max

    @game.update(votes: new_votes)

    respond_to do |format|
      format.html { redirect_to votes_path }
      format.turbo_stream { head :ok }
    end
  end

  def reset
    Game.update_all(votes: 0)
    # Touch each game to trigger broadcasts
    Game.find_each(&:touch)

    respond_to do |format|
      format.html { redirect_to votes_path, notice: "All votes have been reset." }
      format.turbo_stream { head :ok }
    end
  end
end
