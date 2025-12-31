## Features

- session authentication (session code to share)
    - user with types: host, player and mods
    - when hosting / creating a session, the user is automatically set as host
        - get session code
        - set name
    - when joining a session, the user is automatically set as player
    - when joining a session as player 
        - set name
        - set session code
        - if name already exists, join/become as this user
    
- use pundit for authorization
    - host can do everything
    - player can vote and manage games
    - mods can do everything

- session settings page
    - change user type of session users
    - delete session user

- Voting settings
    - users can vote x times for one game
    - When setting "previous game", all other games of different genre get x votes
    - Block "previous game" (previous game is not allowed)
    - Set Voting countdown time (Countdown voting is allowed)
    - Enable "Wheel of Fortune" after voting ended
        - Set games included (top 3, top 5, all games)
        - Set proportioal representation (a part for each vote)

- "Wheel of Fortune"
    - becomes an full size overlay of the voting page
    - synchronized "Wheel of Fortune" for all users
        - (random) result is calculated server side and sent to clients with start time
        - animation (with 5s countdown) plays on all clients simultaneously
        - ending at pre-calculated result
        - shows winner 
