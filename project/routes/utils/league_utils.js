const axios = require("axios");
const DButils = require("./DButils");
const LEAGUE_ID = 271;

async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  // find next closest game
  const next_game = (
    await DButils.execQuery(
      `SELECT TOP 1 date, time, home_team, away_team, field FROM games
       WHERE date >= '${convertDate(new Date())}'
       ORDER BY date ASC, time ASC`
    )
  )[0];

  return {
    league_name: league.data.data.name,
    current_season_name: league.data.data.season.data.name,
    current_stage_name: stage.data.data.name,
    // next game details should come from DB
    next_game_details_date: next_game.date,
    next_game_details_time: next_game.time,
    next_game_details_home_team: next_game.home_team,
    next_game_details_away_team: next_game.away_team,
    next_game_details_field: next_game.field, 
  };
}

function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

exports.getLeagueDetails = getLeagueDetails;
