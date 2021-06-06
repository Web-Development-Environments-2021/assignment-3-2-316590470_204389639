# Assignment-3-2-316590470-204389639

- [Assignment-3-2-316590470-204389639](#assignment-3-2-316590470-204389639)
  - [Database](#database)
  - [Navigator](#navigator)
  - [About](#about)
  - [Register](#register)
  - [Login](#login)
  - [Homepage](#homepage)
  - [PlayerTicket](#playerticket)
  - [TeamTicket](#teamticket)
  - [Search](#search)
  - [CurrentGames](#currentgames)
  - [Favorites](#favorites)
  - [LeagueManagement](#leaguemanagement)

## Database
- api token: Mwml27usORk0jBxwNwFwUKTBYwBACAYNjqLWR48CgykCJlcAFzefB0n3GMjT
- server name: shorlakserver.database.windows.net
- username: shirit
- password: Shorlakserver2021

## Navigator
- Will be implemented in front-end.

## About
- Will be implemented in front-end.

## Register
- route: http://localhost:{port}/Register
- validation checks will be implemented in front-end.
- all users who register will be automatically a fan-user(non admin) and therefore their user_type will be 0.

## Login
- route: http://localhost:{port}/login
- if you wish to login as an admin then please fill as follow:
    ```
    {
        "username": "Israel"
        "password": "israel1!"
    }
    ``` 
- if you wish to login as a fan then please fill as follow:
    ```
    {
        "username": "yarden"
        "password": "yardenl1!"
    }
    ```
- otherwise you may login with another registered user you created yourself.

## Homepage
- route: http://localhost:{port}/

## PlayerTicket
- route: http://localhost:{port}/players/{playerId}/ticketDetails

## TeamTicket
- route http://localhost:{port}/teams/{teamId}/ticketDetails

## Search
- no filters:
  - route: http://localhost:{port}/search
  - you can filter by "name" only, for example:
    - http://localhost:{port}/search?name=sten
    - will return all teams and players with a name that contains "sten"
- players filter:
  - route: http://localhost:{port}/search/players
  - you can filter by "name", "position" and team_name" only, for example:
    - http://localhost:{port}/search/players?name=sten&position=1
    - will return all *players* with a name that contains "sten" and have a position_id equals to 1
- teams filter:
  - route: http://localhost:{port}/search/teams
  - you can filter by "name" only, for example:
    - http://localhost:{port}/search/teams?name=sten
    - will return all *teams* with a name that contains "sten"

## CurrentGames
- route: http://localhost:{port}/league/current_games

## Favorites
- route for players: http://localhost:{port}/users/favoritePlayers
- route for games: http://localhost:{port}/users/favoriteGames
- route for teams: http://localhost:{port}/users/favoriteTeams

## LeagueManagement
- route for manage page: http://localhost:{port}/league/manage
- route for adding event: http://localhost:{port}/games/addEvent
  - you may add only one event at a time
  - we assumed event can be added only for a game which date's is current and have no results
- route for adding game: http://localhost:{port}/league/addGame
- route for adding result: http://localhost:{port}/games/addResult
  - we assumed result can be added only for a game which date's is current and have no results