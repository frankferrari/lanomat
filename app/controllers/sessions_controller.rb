class SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[ new create_host create_join ]

  def new
    if current_user
      redirect_to games_path
    end
    @tab = params[:tab] == "host" ? "host" : "join"
  end

  def create_host
    @session = GameSession.new

    if @session.save
      @user = @session.users.new(name: params[:name], role: :host)
      if @user.save
        login(@user)
        redirect_to games_path, notice: "Session hosted successfully! Code: #{@session.code}"
      else
        @session.destroy
        flash.now[:alert] = "Could not create user: #{@user.errors.full_messages.join(', ')}"
        @tab = "host"
        render :new, status: :unprocessable_entity
      end
    else
      flash.now[:alert] = "Could not create session: #{@session.errors.full_messages.join(', ')}"
      @tab = "host"
      render :new, status: :unprocessable_entity
    end
  end

  def create_join
    code = params[:code].to_s.upcase.strip
    @session = GameSession.find_by(code: code)

    if @session
      name = params[:name].strip
      @user = @session.users.where("LOWER(name) = ?", name.downcase).first

      if @user
        # Existing user logic
        login(@user)
        redirect_to games_path, notice: "Rejoined session as #{@user.name}."
      else
        # New user logic
        @user = @session.users.new(name: name, role: :player)
        if @user.save
          login(@user)
          redirect_to games_path, notice: "Joined session successfully!"
        else
          flash.now[:alert] = "Could not join session: #{@user.errors.full_messages.join(', ')}"
          @tab = "join"
          render :new, status: :unprocessable_entity
        end
      end
    else
      flash.now[:alert] = "Invalid Session Code."
      @tab = "join"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    logout
    redirect_to new_session_path, notice: "Logged out."
  end
end
