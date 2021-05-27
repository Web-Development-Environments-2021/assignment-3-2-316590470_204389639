const DButils = require("./DButils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getGamesInfo(game_ids_list){
  let promises = [];
  game_ids_list.map((id) =>
    promises.push(
      (DButils.execQuery(
          `SELECT date, time, home_team, away_team, field FROM games
          WHERE game_id = ${id}`
      ))[0]
    )
  );
  let games_info = await Promise.all(promises);
  return extractRelevantGameData(games_info);
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