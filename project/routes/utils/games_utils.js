const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getGamesInfo(game_ids_list){
  let games = await DButils.execQuery(
    `SELECT date, time, home_team, away_team, field FROM games
    WHERE game_id in (${game_ids_list.toString()})
    ORDER BY date ASC, time ASC`
  )
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