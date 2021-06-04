-- create table fav_players(
--     user_id int not null,
--     player_id int not null,
-- );

-- create table fav_teams(
--     user_id int not null,
--     team_id int not null,
-- );

-- create table fav_games(
--     user_id int not null,
--     game_id int not null,
-- );

-- select * from fav_teams;
-- select * from fav_players;
-- delete from fav_games where game_id = (
--     select game_id from games
--     where (date<='2021-06-02' AND home_goal is not NULL AND away_goal is not NULL)
-- );
-- select * from games where game_id in (
--     select game_id from fav_games
-- )
-- select * from fav_games
-- select * from fav_players
select * from fav_teams
-- select * from fav_teams
-- where (user_id = '1' and team_id = 85)
-- delete from fav_players
-- delete from fav_teams where user_id=3;