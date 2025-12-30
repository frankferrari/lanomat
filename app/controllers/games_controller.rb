class GamesController < ApplicationController
  def index
    @active_tab = params[:tab] || "vote"

    # Base query
    scope = Game.order(votes: :desc, name: :asc)

    # Filter by Genre if present
    if params[:genre].present? && params[:genre] != "All"
      scope = scope.where(genre: params[:genre])
    end

    @games = scope

    @new_game = Game.new
  end

  def create
    @game = Game.new(game_params)
    if @game.save
      respond_to do |format|
        format.html { redirect_to root_path, notice: "Game added successfully." }
        format.turbo_stream { head :ok }
      end
    else
      @games = Game.order(votes: :desc, name: :asc)
      @new_game = @game
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    @game = Game.find(params[:id])
    @game.destroy
    respond_to do |format|
      format.html { redirect_to root_path, notice: "Game removed." }
      format.turbo_stream { head :ok }
    end
  end

  def vote
    @game = Game.find(params[:id])
    direction = params[:direction] == "down" ? -1 : 1

    # Ensure votes don't go below 0
    new_votes = [ @game.votes + direction, 0 ].max

    @game.update(votes: new_votes)

    respond_to do |format|
      format.html { redirect_to root_path }
      format.turbo_stream { head :ok }
    end
  end

  def reset
    Game.update_all(votes: 0)
    # Since update_all doesn't trigger callbacks, we must manually broadcast the update for all games
    # However, broadcasting to "games" for EVERY game individually would be spammy (N broadcasts).
    # A single "reset" event would be better, but "broadcasts_to" expects simple object CRUD.
    # For now, simplistic approach: redirect or just rely on a page refresh for reset is safer unless we implement custom streams.
    # Let's keep it simple for now and stick to HTML redirect for global reset, OR iterate and touch to trigger broadcasts (slow for many games).
    # Given the constraint of "Lan party" (dozens of games max), iterating is acceptable.
    Game.find_each(&:touch)

    respond_to do |format|
      format.html { redirect_to root_path, notice: "All votes have been reset." }
      format.turbo_stream { head :ok }
    end
  end

  private

  def game_params
    params.require(:game).permit(:name, :genre, :price, :max_players)
  end
end
