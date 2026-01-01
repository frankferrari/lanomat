class VotesController < ApplicationController
  def index
    scope = Current.game_session.games.includes(:tags).order(votes_score: :desc, name: :asc)

    if params[:tag].present? && params[:tag] != "All"
      scope = scope.joins(:tags).where(tags: { name: params[:tag] })
    end

    if Current.game_session.exclude_previous_game? && Current.game_session.previous_game_id.present?
      scope = scope.where.not(id: Current.game_session.previous_game_id)
    end

    @games = scope
    @view_mode = params[:view].presence_in(%w[grid list]) || "grid"
    @voted_game_ids = current_user.votes.where(game: @games).pluck(:game_id).to_set
  end

  def vote
    @game = Current.game_session.games.find(params[:id])

    if Current.game_session.voting_closed?
      respond_to do |format|
        format.html { redirect_to votes_path, alert: "Voting is closed!" }
        format.turbo_stream { render turbo_stream: turbo_stream.replace("flash", partial: "shared/flash", locals: { alert: "Voting is closed!" }) }
      end
      return
    end

    direction = params[:direction]

    existing_vote = current_user.votes.find_by(game: @game)

    if direction == "up"
      if existing_vote
        # Try to increment weight
        existing_vote.weight += 1
        unless existing_vote.save
          flash.now[:alert] = existing_vote.errors.full_messages.join(", ")
          # Reload to reset any invalid changes in memory
          existing_vote.reload
        end
      else
        # Create new vote with weight 1 (standard vote)
        new_vote = current_user.votes.build(game: @game, weight: 1)
        unless new_vote.save
           flash.now[:alert] = new_vote.errors.full_messages.join(", ")
        end
      end
    else
      if existing_vote
        if existing_vote.weight > 1
          existing_vote.weight -= 1
          existing_vote.save
        else
          existing_vote.destroy
        end
      end
    end

    @game.reload
    @voted = current_user.voted_for?(@game)
    @view_mode = params[:view].presence_in(%w[grid list]) || "grid"

    respond_to do |format|
      format.html { redirect_to votes_path }
      format.turbo_stream
    end
  end

  def reset
    Vote.joins(:game).where(games: { game_session: Current.game_session }).destroy_all
    Current.game_session.games.update_all(votes_score: 0)

    respond_to do |format|
      format.html { redirect_to votes_path, notice: "All votes have been reset." }
      format.turbo_stream { redirect_to votes_path }
    end
  end
end
