class MigrateGenresToTags < ActiveRecord::Migration[8.0]
  def up
    # Migrate existing genre data to tags
    # Get all unique genres from games
    genres = Game.where.not(genre: [ nil, '' ]).pluck(:genre).uniq

    # Create tags for each genre
    genre_tag_map = {}
    genres.each do |genre|
      tag = Tag.find_or_create_by!(name: genre)
      genre_tag_map[genre] = tag.id
    end

    # Associate games with their corresponding tags
    Game.where.not(genre: [ nil, '' ]).find_each do |game|
      if genre_tag_map[game.genre]
        GameTag.create!(game_id: game.id, tag_id: genre_tag_map[game.genre])
      end
    end

    # Remove the genre column
    remove_column :games, :genre
  end

  def down
    # Add genre column back
    add_column :games, :genre, :string

    # Migrate tags back to genre (just take the first tag)
    Game.find_each do |game|
      if game.tags.any?
        game.update_column(:genre, game.tags.first.name)
      end
    end

    # Note: We don't delete tags or game_tags to avoid data loss
  end
end
