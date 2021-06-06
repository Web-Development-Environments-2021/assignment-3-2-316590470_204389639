Assignment-3-2-316590470-204389639

- [Navigator](#Navigator)
- [About](#About)
- [Register](#Register)
- [Login](#Login)
- [Homepage](#Homepage)
- [PlayerTicket](#PlayerTicket)
- [TeamTicket](#TeamTicket)
- [Search](#Search)
- [CurrentGames](#CurrentGames)
- [Favorites](#Favorites)
- [LeagueManagement](#LeagueManagement)

# 1. Navigator
## 1.1. Will be implemented in front-end.

# 2. About
## 2.1. Will be implemented in front-end.

# 3. Register
## 3.1. route: http://localhost:{port}/Register
## 3.2. validation checks will be implemented in front-end.
## 3.3. all users who register will be automatically a fan-user(non admin) and therefore their user_type will be 0.

# 4. Login
## 4.1. route: http://localhost:{port}/login
## 4.2. if you wish to login as an admin then please fill as follow:
### 4.2.1. username: "Israel"
### 4.2.2. password: "israel1!"
## 4.3. if you wish to login as a fan then please fill as follow:
### 4.3.1. username: "yarden"
### 4.3.2. password: "yardenl1!"
## 4.4. otherwise you may login with another registered user you created yourself.

# 5. Homepage
## 5.1. route: http://localhost:{port}/

# 6. PlayerTicket
## 6.1. route: http://localhost:{port}/players/{playerId}/ticketDetails

# 7. TeamTicket
## 7.1. route http://localhost:{port}/teams/{teamId}/ticketDetails

# 8. Search
## 8.1. no filters:
### 8.1.1. route: http://localhost:{port}/search
### 8.1.2. you can filter by "name" only, for example:
#### 8.1.2.1. http://localhost:{port}/search?name=sten
#### 8.1.2.2. will return all teams and players with a name that contains "sten"
## 8.2. players filter:
### 8.2.1. route: http://localhost:{port}/search/players
### 8.2.2. you can filter by "name", "position" and team_name" only, for example:
#### 8.2.2.1. http://localhost:{port}/search/players?name=sten&position=1
#### 8.2.2.2. will return all *players* with a name that contains "sten" and have a position_id equals to 1
## 8.3. teams filter:
### 8.3.1. route: http://localhost:{port}/search/teams
### 8.3.2. you can filter by "name" only, for example:
#### 8.3.2.1. http://localhost:{port}/search/teams?name=sten
#### 8.3.2.2. will return all *teams* with a name that contains "sten"

# 9. CurrentGames
## 9.1. route: http://localhost:{port}/league/current_games

# 10. Favorites
## 10.1. route for players: http://localhost:{port}/users/favoritePlayers
## 10.2. route for games: http://localhost:{port}/users/favoriteGames
## 10.3. route for teams: http://localhost:{port}/users/favoriteTeams

# 11. LeagueManagement
## 11.1. route for manage page: http://localhost:{port}/league/manage
## 11.2. route for adding event: http://localhost:{port}/games/addEvent
### 11.2.1. you may add only one event at a time
### 11.2.2. we assumed event can be added only for a game which date's is current and have no results
## 11.3. route for adding game: http://localhost:{port}/league/addGame
## 11.4. route for adding result: http://localhost:{port}/games/addResult
### 11.4.1. we assumed result can be added only for a game which date's is current and have no results