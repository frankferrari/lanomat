class PlayersController < ApplicationController
  before_action :set_user, only: [ :update, :destroy, :promote, :demote ]

  def index
    authorize User
    @users = Current.game_session.users.order(:created_at)
  end

  def update
    authorize @user

    if @user.update(user_params)
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace(@user, partial: "players/player_row", locals: { user: @user }) }
        format.html { redirect_to players_path, notice: "Player updated." }
      end
    else
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace(@user, partial: "players/player_row", locals: { user: @user }) }
        format.html { redirect_to players_path, alert: "Failed to update player." }
      end
    end
  end

  def destroy
    authorize @user

    if @user == current_user
      redirect_to players_path, alert: "You cannot remove yourself."
      return
    end

    @user.destroy
    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.remove(@user) }
      format.html { redirect_to players_path, notice: "Player removed." }
    end
  end

  def promote
    authorize @user

    @user.update!(role: :host)
    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.replace(@user, partial: "players/player_row", locals: { user: @user }) }
      format.html { redirect_to players_path, notice: "#{@user.name} is now a host." }
    end
  end

  def demote
    authorize @user

    # Check if this is the last host
    if Current.game_session.users.host.count <= 1
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace(@user, partial: "players/player_row", locals: { user: @user, error: "Cannot demote the last host." }) }
        format.html { redirect_to players_path, alert: "Cannot demote the last host. At least one host must remain." }
      end
      return
    end

    @user.update!(role: :player)
    respond_to do |format|
      format.turbo_stream { render turbo_stream: turbo_stream.replace(@user, partial: "players/player_row", locals: { user: @user }) }
      format.html { redirect_to players_path, notice: "#{@user.name} is now a player." }
    end
  end

  private

  def set_user
    @user = Current.game_session.users.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:name)
  end
end
