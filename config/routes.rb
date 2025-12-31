Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  root "votes#index"

  # Voting interface
  resources :votes, only: [ :index ] do
    member do
      post :vote
    end
    collection do
      post :reset
    end
  end

  # Games management
  resources :games, only: [ :index, :create, :destroy, :update ]

  resources :tags, only: [ :index, :create ]

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
