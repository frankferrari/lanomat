class TagsController < ApplicationController
  def index
    @tags = Tag.order(:name)
    render json: @tags
  end

  def create
    @tag = Tag.find_or_create_by(name: params[:name])

    if @tag.persisted?
      render json: @tag, status: :created
    else
      render json: { errors: @tag.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
