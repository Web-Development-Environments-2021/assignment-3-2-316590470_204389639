const axios = require("axios");
const DButils = require("./DButils");
const games_utils = require("./games_utils");
const LEAGUE_ID = 271;

async function getLeagueDetails() {
  try{
    const league = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
      {
        params: {
          include: "season",
          api_token: process.env.api_token,
        },
      }
    );
    var league_name = league.data.data.name;
    var current_season_name = league.data.data.season.data.name;
  } catch(error){
    var league_name = "no such league found";
    var current_season_name = "no such league found";
  }
  
  try{
    var stage = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    var current_stage_name = stage.data.data.name;
  }catch(error){
    var current_stage_name = "no current stage";
  }

  // find next closest game
  let tdate = convertDate(new Date());
  const next_game = (
    
    await DButils.execQuery(
      `SELECT TOP 1 game_id, date, time, home_team, away_team, field FROM games
       WHERE date >= '${tdate}'
       ORDER BY date ASC, time ASC`
    )
  )[0];

  // if no next games found
  if( !next_game ){
    return{
      league_name: league_name,
      current_season_name: current_season_name,
      current_stage_name: current_stage_name,
      next_game_details: "no future games were found",
    }
  }
  const next_game_details = (await games_utils.getGamesInfo([next_game.game_id]))[0];

  const temp = {
    league_name: league_name,
    current_season_name: current_season_name,
    current_stage_name: current_stage_name,
    // next game details should come from DB
    next_game_details_date: next_game_details.date,
    next_game_details_time: next_game_details.time,
    next_game_details_home_team: next_game_details.home_team,
    next_game_details_away_team: next_game_details.away_team,
    next_game_details_field: next_game_details.field, 
  };
  return temp;
}

function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

function convertTime(date){
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();

  return hh+":"+mm+":"+ss;
}


exports.getLeagueDetails = getLeagueDetails;
exports.convertDate = convertDate;
exports.convertTime = convertTime;
