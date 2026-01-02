class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  private

  def mobile_device?
    request.user_agent =~ /Mobile|webOS|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  end
  helper_method :mobile_device?
end
