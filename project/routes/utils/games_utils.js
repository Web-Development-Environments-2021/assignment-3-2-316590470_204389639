const DButils = require("./DButils");
const teams_utils = require("./teams_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getGamesInfo(game_ids_list){
  let games_with_ids = await DButils.execQuery(
    `SELECT date, time, home_team, away_team, field FROM games
    WHERE game_id in (${game_ids_list.toString()})
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





exports.getGamesInfo = getGamesInfo;