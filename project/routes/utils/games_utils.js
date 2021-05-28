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

/*
* returns *occured* already games according to gameFull:
  date, time, home team, away team and field, home goal, away goal, event.
*/
async function getOldGamesInfo(game_ids_list){
  const current_date = league_utils.convertDate(new Date());
  let games_with_ids = await DButils.execQuery(
    `SELECT * FROM games
    WHERE game_id in (${game_ids_list.toString()})
    AND (date <= '${current_date} AND home_goal is not NULL AND away_goal is not NULL)'
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
      home_goal: game.home_goal,
      away_goal: game.away_goal,
      event: game.event,
    };
  })
  let games = await Promise.all(games_with_names);
  return games.map((game_info) => {
    return {
      date: game_info.date,
      time: game_info.time,
      home_team: game_info.home_team,
      away_team: game_info.away_team,
      field: game_info.field,
      home_goal: game_info.home_goal,
      away_goal: game_info.away_goal,
      event: game_info.event,
    };
  });
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

exports.getGamesInfo = getGamesInfo;