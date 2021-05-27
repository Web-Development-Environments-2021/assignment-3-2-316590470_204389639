
create table games(
    game_id int not null UNIQUE,
    date date not null,
    time time not null,
    home_team int not null,
    away_team int not null,
    field varchar(30) not null,
    home_goal int,
    away_goal int,
    event varchar(300),
);

insert into games(game_id, date, time, home_team, away_team, field,home_goal, away_goal, event)
VALUES( 1 , '2021-05-04' , ' 15:30:00' , 83 , 10086 , 'San Siro', 2 , 0 ,'good game');
insert into games(game_id, date, time, home_team, away_team, field,home_goal, away_goal, event)
VALUES( 2 , '2021-07-04' , ' 15:30:00' , 103 , 83 , 'San Siro', 0 , 1 ,'good game');
insert into games(game_id, date, time, home_team, away_team, field,home_goal, away_goal, event)
VALUES( 3 , '2021-08-04' , ' 15:30:00' , 103 , 10086 , 'San Siro', 2 , 0 ,'good game');
insert into games(game_id, date, time, home_team, away_team, field,home_goal, away_goal, event)
VALUES( 4 , '2021-08-05' , ' 15:30:00' , 83 , 10086 , 'San Siro', 2 , 0 ,'good game');
select * from games