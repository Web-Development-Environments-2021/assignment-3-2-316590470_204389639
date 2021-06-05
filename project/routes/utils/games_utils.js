const DButils = require("./DButils");
const teams_utils = require("./teams_utils");
const league_utils = require("./league_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

/*
* returns *not occured* yet games according to gamePreview:
  date, time, home team, away team and field.
*/
async function getGamesInfo(game_ids_list){

  const current_date = league_utils.convertDate(new Date());
  let games_with_ids = await DButils.execQuery(
    `SELECT date, time, home_team, away_team, field FROM games
    WHERE game_id in (${game_ids_list.toString()})
    AND date >= '${current_date}'
    ORDER BY date ASC, time ASC`
  )
  
  let games_with_names = games_with_ids.map( async (game)=>{
    const home_team_name = await teams_utils.getTeamNameById(game.home_team);
    const away_team_name = await teams_utils.getTeamNameById(game.away_team);
    return {
      date: game.date,
      time: game.time,
      home_team: home_team_name.name,
      away_team: away_team_name.name,
      field: game.field,
    };
  })
  let games = await Promise.all(games_with_names);
  return extractRelevantGameData(games);
}

function extractRelevantGameData(games_info) {
    return games_info.map((game_info) => {
      
      return {
        date: game_info.date,
        time: game_info.time,
        home_team: game_info.home_team,
        away_team: game_info.away_team,
        field: game_info.field,
      };
    });
  }
async function getGameEvents(GID){
  const eventList = await DButils.execQuery(
    `select * from events where GID = ${GID}`
    );
  let promise =await Promise.all(eventList)
  return eventList.map((event)=>{
    return{
      date: event.date,
      time:event.time,
      minute: event.minute,
      eventType: event.event_type,
      player: event.player
    };
    
  });
  
}


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

async function gameHasFinishedAlready(game_id){
  const game = (await DButils.execQuery(
    `select home_goal, away_goal, date from games
     where game_id = ${game_id};`)
  )[0];
  if(game.home_goal != null || game.away_goal != null || game.date != league_utils.convertDate(new Date())){
    return 1;
  }
  return 0;
}

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

exports.getGamesInfo = getGamesInfo;
exports.addResultToGame = addResultToGame;
exports.gameHasFinishedAlready = gameHasFinishedAlready;
exports.addEventToGame = addEventToGame;
exports.getGameEvents = getGameEvents;
exports.getGamesInfo = getGamesInfo;
