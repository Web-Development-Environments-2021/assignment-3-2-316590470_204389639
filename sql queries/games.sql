create table games(
    game_id int not null UNIQUE,
    date date not null,
    time time not null,
    home_team varchar(30) not null,
    away_team varchar(30) not null,
    field varchar(30) not null,
    home_goal int,
    away_goal int,
    event varchar(300),
);

insert into games (game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
values (1, '2021-06-01', '15:30:00', 'Inter', 'Barcelona', 'Camp Nou', NULL, NULL, NULL);

insert into games (game_id, date, time, home_team, away_team, field, home_goal, away_goal, event)
values (2, '2021-06-09', '15:30:00', 'Manchester United', 'Barcelona', 'Manchester', NULL, NULL, NULL);

select * from games
