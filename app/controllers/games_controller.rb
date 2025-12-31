class GamesController < ApplicationController
  def index
    # Management index view
    @games = Current.game_session.games.includes(:tags).order(name: :asc)
    @new_game = Current.game_session.games.new
  end

  def create
    @game = Current.game_session.games.new(game_params)
    if @game.save
      respond_to do |format|
        format.html { redirect_to games_path, notice: "Game added successfully." }
        format.turbo_stream { head :ok }
      end
    else
      @games = Game.includes(:tags).order(name: :asc)
      @new_game = @game
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    @game = Game.find(params[:id])
    @game.destroy
    respond_to do |format|
      format.html { redirect_to games_path, notice: "Game removed." }
      format.turbo_stream { head :ok }
    end
  end

  def update
    @game = Game.find(params[:id])
    if @game.update(game_params)
      respond_to do |format|
        format.html { redirect_to games_path, notice: "Game updated." }
        format.turbo_stream { head :ok }
      end
    else
      @games = Game.includes(:tags).order(name: :asc)
      @new_game = Game.new
      render :index, status: :unprocessable_entity
    end
  end

  private

  def game_params
    params.require(:game).permit(:name, :price, :max_players, tag_ids: [])
  end
end
