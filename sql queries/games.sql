-- create table games(
--     game_id int not null UNIQUE,
--     date date not null,
--     time time not null,
--     home_team int not null,
--     away_team int not null,
--     field varchar(30) not null,
--     home_goal int,
--     away_goal int,
--     event varchar(300),
-- );

-- insert into games (game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
-- values (1, '2021-06-01', '15:30:00', 'Inter', 'Barcelona', 'Camp Nou', NULL, NULL, NULL);

-- insert into games (game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
-- values (2, '2021-06-09', '15:30:00', 'Manchester United', 'Barcelona', 'Manchester', NULL, NULL, NULL);

-- insert into games(game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
-- values (5, '2021-05-30', '15:00:00', 83, 103, 'Camp Nou', NULL, NULL, NULL);

-- insert into games(game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
-- values (6, '2021-05-30', '09:00:00', 103, 83, 'Camp Nou', 3, 1, 'bla');

-- insert into games(game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
-- values (7, '2021-06-30', '10:00:00', 103, 83, 'Camp Nou', NULL, NULL, NULL);

-- delete from fav_games where user_id = 1 and game_id = 7
-- delete from games where game_id > 8
-- update games
-- SET
--     home_goal = NULL,
--     away_goal = NULL
-- WHERE
--     game_id = 5;
-- delete from fav_games where (user_id = 1 and game_id = 7)
select * from fav_games