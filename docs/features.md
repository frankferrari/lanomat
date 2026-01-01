## Features

### Session Authentication
- [x] Session authentication (session code to share)
  - [x] User types: host, player, mods
  - [x] When hosting/creating a session, user automatically set as host
    - [x] Get session code
    - [x] Set name
  - [x] When joining a session, user automatically set as player
  - [x] When joining as player
    - [x] Set name
    - [x] Set session code
    - [x] If name already exists, join/become as this user

### Authorization
- [ ] Use Pundit for authorization
  - [ ] Host can do everything (settings, users management)
  - [ ] Player can vote and manage games

### Voting Settings
- [X] Users can apply more than one vote, as bonus votes from the bonus pool
- [x] When setting "previous game", all other games of different genre get x votes
- [x] Block "previous game" (previous game is not allowed)
- [x] Set voting countdown time (countdown voting is allowed)
- [ ] Enable "Wheel of Fortune" after voting ended
  - [ ] Set games included (top 3, top 5, all games)
  - [ ] Set proportional representation (a part for each vote)

### Wheel of Fortune
- [ ] Becomes a full size overlay of the voting page
- [ ] Synchronized "Wheel of Fortune" for all users
  - [ ] (Random) result calculated server side and sent to clients with start time
  - [ ] Animation (with 5s countdown) plays on all clients simultaneously
  - [ ] Ends at pre-calculated result
  - [ ] Shows winner

### Nice to Have
- [x] Add gradient background color transformation depending on votes
- [x] Instant dynamic update of the voting results
- [x] Allow negative votes
- [ ] Reset Voting button for host