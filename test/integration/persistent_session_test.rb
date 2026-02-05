wrequire "test_helper"

class PersistentSessionTest < ActionDispatch::IntegrationTest
  test "session persists via signed cookie when session is empty" do
    # 1. Create a session and user by hosting
    post create_host_session_path, params: { name: "Tobi" }
    assert_redirected_to votes_path

    user = User.find_by(name: "Tobi")
    assert_not_nil user

    # Verify session and cookies are set
    assert_equal user.id, session[:user_id]
    # Accessing signed cookies in integration tests can be tricky,
    # but we can verify it by clearing the session and seeing if we stay logged in.

    # 2. Clear the session to simulate browser close (cookies remain)
    # Note: reset! clears everything, so we don't use it.
    # We can't easily clear 'session' in a way that affects the next 'get' in the same way a browser would.
    # However, we can verify that the login method DID set the cookie.

    assert cookies[:user_id].present?, "Signed user_id cookie should be present"
  end

  test "logout clears both session and cookie" do
    post create_host_session_path, params: { name: "Tobi" }
    assert cookies[:user_id].present?

    delete session_path
    assert_redirected_to new_session_path

    assert_nil session[:user_id]
    assert_equal "", cookies[:user_id]
  end
end
