-- create table fav_players(
--     user_id int not null,
--     full_name varchar(300) not null,
--     current_team_name VARCHAR(20) not null,
--     picture VARCHAR(300),
--     position_number int not null,
-- );

-- create table fav_teams(
--     user_id int not null,
--     team_id int not null,
--     team_name VARCHAR(20) not null,
--     symbol varchar(300),
--     favorite varchar(6) not null,
-- );

-- create table fav_games(
--     user_id int not null,
--     game_id int not null,
--     date date not null,
--     time time not null,
--     home_team varchar(20) not null,
--     away_team VARCHAR(20) not null,
--     field varchar(20) not null,
-- );

-- drop table users;

-- create table users(
--     user_id int not null UNIQUE,
--     username varchar(255) not null, 
--     password VARCHAR(255) not null,
--     user_type int not null,
--     email varchar(255) not null,
-- )

-- select * from users
-- update users
-- set 
--     email = 'israel@gmail.com'
-- WHERE
--     username = 'Israel'
-- alter table users
-- add email varchar(255);
-- select * from fav_games
delete from users where user_id = 3