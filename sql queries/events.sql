select * from events

-- drop table events;
-- create table events (
--     EID int not null UNIQUE,
--     GID int not null,
--     minute int not null,
--     date varchar(255),
--     time varchar(255),
--     player int not null,
--     event_type varchar(255) not null,
--     PRIMARY KEY (GID, minute, player, event_type)
-- )
-- ALTER TABLE events
-- ADD event_type VARCHAR (255) NULL;
-- alter table events add primary key (GID,minute,player,event_type);
