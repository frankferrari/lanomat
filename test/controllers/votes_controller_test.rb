require "test_helper"

class VotesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @game_session = game_sessions(:one)
    @user = users(:one)
    @game = games(:one)
  end

  test "should destroy vote when upvoting from downvote" do
    # 1. Login
    post create_join_session_path, params: { code: @game_session.code, name: @user.name }
    assert_response :redirect
    follow_redirect!
    assert_equal votes_path, path

    # 2. Downvote
    post vote_vote_path(@game), params: { direction: "down" }

    # Reload vote to verify it is -1
    vote = @user.votes.find_by(game: @game)
    assert_not_nil vote
    assert_equal(-1, vote.weight)

    # 3. Upvote (Fix verification)
    post vote_vote_path(@game), params: { direction: "up" }

    # Reload vote to verify it is destroyed (nil)
    assert_nil @user.votes.find_by(game: @game)
  end
end
