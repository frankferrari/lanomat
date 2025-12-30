# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

Game.destroy_all

games_data = [
  { name: "Conan Exiles", genre: "Survival RPG", price: "~4.36 €", max_players: 40 },
  { name: "Icarus", genre: "Survival", price: "~3.39 €", max_players: 8 },
  { name: "Helldivers 2", genre: "TPS", price: "~22.75 €", max_players: 4 },
  { name: "Underlords", genre: "Auto Battler", price: "Free", max_players: 8 },
  { name: "Overwatch 2", genre: "Hero Shooter", price: "Free", max_players: 10 },
  { name: "Starcraft 2", genre: "RTS", price: "", max_players: nil },
  { name: "Heroes of the Storm", genre: "MOBA", price: "Free", max_players: 10 },
  { name: "Company of Heroes 1", genre: "RTS", price: "", max_players: nil },
  { name: "Company of Heroes 2", genre: "RTS", price: "", max_players: nil },
  { name: "Company of Heroes 3", genre: "RTS", price: "", max_players: nil },
  { name: "Crusader Kings 3", genre: "Grand Strategy", price: "", max_players: nil },
  { name: "Stellaris", genre: "Grand Strategy", price: "", max_players: nil },
  { name: "DayZ", genre: "Survival", price: "", max_players: nil },
  { name: "Project Zomboid", genre: "Survival", price: "", max_players: nil },
  { name: "7 Days to Die", genre: "Survival", price: "", max_players: nil },
  { name: "Dont Starve together", genre: "Survival", price: "", max_players: nil },
  { name: "Battlefield 6", genre: "FPS", price: "", max_players: nil },
  { name: "Battlebits", genre: "FPS", price: "", max_players: nil },
  { name: "Wreckfest 1", genre: "Racing", price: "", max_players: nil },
  { name: "Wreckfest 2", genre: "Racing", price: "", max_players: nil },
  { name: "Battlefield 6 Portal", genre: "FPS", price: "", max_players: nil },
  { name: "Diablo 2 Ressuracted", genre: "ARPG", price: "", max_players: nil },
  { name: "Transport Tycoon Deluxe", genre: "Simulation", price: "", max_players: nil },
  { name: "Hell Let Loose", genre: "FPS", price: "", max_players: nil },
  { name: "Squad", genre: "FPS", price: "", max_players: nil },
  { name: "Command and Conquer red Alert 2", genre: "RTS", price: "", max_players: nil },
  { name: "Valheim", genre: "Survival", price: "", max_players: nil }
]

games_data.each do |game_attr|
  Game.find_or_create_by!(name: game_attr[:name]) do |game|
    game.genre = game_attr[:genre]
    game.price = game_attr[:price]
    game.max_players = game_attr[:max_players]
  end
end

puts "Created #{Game.count} games."
