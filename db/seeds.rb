# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

Game.destroy_all
Tag.destroy_all
User.destroy_all
GameSession.destroy_all

# Create Default Session
session = GameSession.create!(code: "AAAAA")
puts "Created Session: #{session.code}"

# Create Users
host = User.create!(name: "HostUser", role: :host, game_session: session)
player1 = User.create!(name: "Player1", role: :player, game_session: session)
player2 = User.create!(name: "Player2", role: :player, game_session: session)
puts "Created Users: #{host.name}, #{player1.name}, #{player2.name}"

games_data = [
  { name: "Conan Exiles", tags: [ "Survival", "RPG" ], price: "~4.36 €", max_players: 40 },
  { name: "Icarus", tags: [ "Survival" ], price: "~3.39 €", max_players: 8 },
  { name: "Helldivers 2", tags: [ "TPS", "Co-op" ], price: "~22.75 €", max_players: 4 },
  { name: "Underlords", tags: [ "Auto Battler", "Strategy" ], price: "Free", max_players: 8 },
  { name: "Overwatch 2", tags: [ "Hero Shooter", "FPS" ], price: "Free", max_players: 10 },
  { name: "Starcraft 2", tags: [ "RTS", "Strategy" ], price: "", max_players: nil },
  { name: "Heroes of the Storm", tags: [ "MOBA" ], price: "Free", max_players: 10 },
  { name: "Company of Heroes 1", tags: [ "RTS", "Strategy" ], price: "", max_players: 8 },
  { name: "Company of Heroes 2", tags: [ "RTS", "Strategy" ], price: "", max_players: 8 },
  { name: "Company of Heroes 3", tags: [ "RTS", "Strategy" ], price: "", max_players: 8 },
  { name: "Crusader Kings 3", tags: [ "Grand Strategy", "Strategy" ], price: "", max_players: 32 },
  { name: "Stellaris", tags: [ "Grand Strategy", "Strategy" ], price: "", max_players: 32 },
  { name: "DayZ", tags: [ "Survival", "FPS" ], price: "", max_players: 100 },
  { name: "Project Zomboid", tags: [ "Survival", "Zombie" ], price: "", max_players: 16 },
  { name: "7 Days to Die", tags: [ "Survival", "Zombie" ], price: "", max_players: nil },
  { name: "Dont Starve together", tags: [ "Survival", "Co-op" ], price: "", max_players: nil },
  { name: "Battlefield 6", tags: [ "FPS", "Shooter" ], price: "", max_players: nil },
  { name: "Battlebits", tags: [ "FPS", "Shooter" ], price: "", max_players: nil },
  { name: "Wreckfest 1", tags: [ "Racing" ], price: "", max_players: nil },
  { name: "Wreckfest 2", tags: [ "Racing" ], price: "", max_players: nil },
  { name: "Battlefield 6 Portal", tags: [ "FPS", "Shooter" ], price: "", max_players: nil },
  { name: "Diablo 2 Ressuracted", tags: [ "ARPG", "RPG" ], price: "", max_players: nil },
  { name: "Transport Tycoon Deluxe", tags: [ "Simulation", "Strategy" ], price: "", max_players: nil },
  { name: "Hell Let Loose", tags: [ "FPS", "Shooter" ], price: "", max_players: nil },
  { name: "Squad", tags: [ "FPS", "Shooter" ], price: "", max_players: nil },
  { name: "Command and Conquer red Alert 2", tags: [ "RTS", "Strategy" ], price: "", max_players: nil },
  { name: "Valheim", tags: [ "Survival", "Co-op" ], price: "", max_players: nil }
]

games_data.each do |game_attr|
  game = session.games.find_or_create_by!(name: game_attr[:name]) do |g|
    g.price = game_attr[:price]
    g.max_players = game_attr[:max_players]
  end

  # Associate tags
  tag_names = game_attr[:tags] || []
  tags = tag_names.map do |tag_name|
    Tag.find_or_create_by!(name: tag_name)
  end
  game.tags = tags
end

puts "Created #{Game.count} games and #{Tag.count} tags."
