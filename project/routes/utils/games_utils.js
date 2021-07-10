const DButils = require("./DButils");
const teams_utils = require("./teams_utils");
const league_utils = require("./league_utils");
const players_utils = require("./players_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

/*
* returns not occured yet games according to gamePreview:
  date, time, home team, away team and field.
*/
async function getGamesInfo(game_ids_list){
  
  const current_date = league_utils.convertDate(new Date());
  let games_with_ids = await DButils.execQuery(
    `SELECT game_id, date, time, home_team, away_team, field FROM games
    WHERE game_id in (${game_ids_list.toString()})
    AND (date >= '${current_date}'  
    AND home_goal is NULL AND away_goal is NULL)
    ORDER BY date ASC, time ASC`
  )
  
  let games_with_names = [];
  for(let i =0; i< games_with_ids.length; i++){
    const game = games_with_ids[i];
    const home_team_name = await teams_utils.getTeamNameById(game.home_team);
    const away_team_name = await teams_utils.getTeamNameById(game.away_team);
    games_with_names.push({
      game_id: game.game_id,
      date: game.date,
      time: game.time,
      home_team: home_team_name.name,
      home_team_logo: home_team_name.logo,
      away_team: away_team_name.name,
      away_team_logo: away_team_name.logo,
      field: game.field,
    });
  };
  let games = await Promise.all(games_with_names);
  return extractRelevantGameData(games);
}

/*
* this function retrieves all game previews fields.
  input: list of games of type JSON
  return: games' previews of type JSON
*/
function extractRelevantGameData(games_info) {
    return games_info.map((game_info) => {
      
      return {
        game_id: game_info.game_id,
        date: league_utils.convertDate(game_info.date),
        time: league_utils.convertTime(game_info.time),
        home_team: game_info.home_team,
        away_team: game_info.away_team,
        field: game_info.field,
        home_team_logo: game_info.home_team_logo,
        away_team_logo: game_info.away_team_logo,
      };
    });
  }

/*
* this function returns all events belong to specific game
  input: (int) GID, game idenitifier
  return: list of events of type JSON
*/
async function getGameEvents(GID){
  const eventList = await DButils.execQuery(
    `select * from events where GID = ${GID}`
    );
  let promise =await Promise.all(eventList)
  let events = [];
  for(let i=0; i< eventList.length; i++){
    const event = eventList[i];
    events.push({
      date: event.date,
      time: event.time.toString().substr(0,5),
      minute: event.minute,
      eventType: event.event_type,
      player: (await players_utils.getPlayersInfo([event.player]))[0].name,
    })
  }
  return events;
}

/*
* this function adds a result to not occured game due to current Date
  input: (int) game_id (game's identifier), (int) home_result (home total goals), (int) away_result (away total goals)
  return: (int) 1 as in for success
*/
async function addResultToGame(game_id, home_result, away_result){
  const game = (await DButils.execQuery(
      `UPDATE games
       SET 
         home_goal = ${home_result},
         away_goal = ${away_result}
       WHERE
         game_id = ${game_id};`
  ));
  return 1;
}

/*
* checks if game has finished or is a future game;
  return number: 0 - all good, 1 - game has finished,
   2 - game does not exist, 3 - its a future game.
*/
async function gameHasFinishedAlready(game_id){
  const game = (await DButils.execQuery(
    `select home_goal, away_goal, date, time from games
     where game_id = ${game_id};`)
  )[0];
  if(game){
    if(game.home_goal != null || game.away_goal != null){
      return 1;
    }
    
    // if game is today but later than now OR if game is tomorrow and on.
    if((league_utils.convertDate(game.date) == league_utils.convertDate(new Date())
     && league_utils.convertTime(game.time) > league_utils.convertTime(new Date()))
      || league_utils.convertDate(game.date) > league_utils.convertDate(new Date())){
      return 3;
    }
    return 0;
  }
  return 2;
}

/*
* this function adds en event to not occured yet game due to current date
  input: (int) game_id (game's identifier), (int) minute (minute of event at game), (JSON) description
  return: none
*/
async function addEventToGame(game_id, minute, description){
  let next_event_id = (await DButils.execQuery(
    'select * from events'
  ));

  next_event_id = next_event_id.length+1;
  // inserting new event, and updating date and hour according to games table.
  DButils.execQuery(
    `insert into events (EID, GID, minute, date, time, player, event_type)
    values (${next_event_id}, ${game_id}, ${minute}, NULL, NULL, ${description.player_id}, '${description.event_type}');
    
    update events
    set
      events.date = (select date from games where game_id = ${game_id}),
      events.time = (select time from games where game_id = ${game_id})
    where
      EID = ${next_event_id};`
  );
}

/*
* this function checks if game exists on database
  input: (int) game_id (game's identifer),
  return: (int) 0 - if game was found in the db, (int) 1 - otherwise
*/
async function gameExists(game_id){
  const result = await DButils.execQuery(
    `select * from games where game_id = ${game_id}`
  );
  // if game was found in DB then return 0
  if(result){
    return 0;
  }
  return 1;
}

exports.getGamesInfo = getGamesInfo;
exports.addResultToGame = addResultToGame;
exports.gameHasFinishedAlready = gameHasFinishedAlready;
exports.addEventToGame = addEventToGame;
exports.getGameEvents = getGameEvents;
exports.getGamesInfo = getGamesInfo;
exports.gameExists = gameExists;