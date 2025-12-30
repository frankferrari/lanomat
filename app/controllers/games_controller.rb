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
      redirect_to root_path, notice: "Game added successfully."
    else
      @games = Game.order(votes: :desc, name: :asc)
      @new_game = @game
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    @game = Game.find(params[:id])
    @game.destroy
    redirect_to root_path, notice: "Game removed."
  end

  def vote
    @game = Game.find(params[:id])
    direction = params[:direction] == "down" ? -1 : 1

    # Ensure votes don't go below 0
    new_votes = [ @game.votes + direction, 0 ].max

    @game.update(votes: new_votes)
    redirect_to root_path
  end

  def reset
    Game.update_all(votes: 0)
    redirect_to root_path, notice: "All votes have been reset."
  end

  private

  def game_params
    params.require(:game).permit(:name, :genre, :price, :max_players)
  end
end
