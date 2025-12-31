module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :set_current_attributes
    before_action :authenticate_user!
    helper_method :current_user
  end

  private

  def authenticate_user!
    redirect_to new_session_path, alert: "Please join a session first." unless current_user
  end

  def set_current_attributes
    if (user_id = session[:user_id])
      Current.user = User.find_by(id: user_id)
      Current.game_session = Current.user&.game_session
    end
  end

  def current_user
    Current.user
  end

  def login(user)
    session[:user_id] = user.id
    Current.user = user
    Current.game_session = user.game_session
  end

  def logout
    session[:user_id] = nil
    Current.user = nil
    Current.game_session = nil
  end
end
