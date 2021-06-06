const axios = require("axios");
const DButils = require("./DButils");
const games_utils = require("./games_utils");
const teams_utils = require("./teams_utils");
const games = require("./games_utils");
const LEAGUE_ID = 271;

async function getCurrentSeason(){
  try{
    const league = await axios.get(
      `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
      {
        params: {
          api_token: process.env.api_token,
        },
      }
    );
    var current_season_id = league.data.data.current_season_id;
    return current_season_id;
  } catch(error){
    return 1;
  }
}

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

async function getPastAndFutureGames(){
  //retriving all relevant games from the DB if existing
  let tdate = convertDate(new Date())
  let past_games = await DButils.execQuery(
     `select * from games
      where (date <= '${tdate}' and home_goal is not NULL and away_goal is not NULL)
      order by date ASC, time ASC`);
      
  let future_games = await DButils.execQuery(
     `select game_id,date, time, home_team, away_team, field from games 
      where (date >= '${tdate}' and home_goal is NULL and away_goal is NULL) 
      order by date ASC , time ASC`);
  
  
  // change the numeric team_id to the formal team name for both home and away teams
  let games_with_events = past_games.map(async(game)=>{
     home_id = game.home_team;
     home_team_name = await teams_utils.getTeamNameById(home_id);
     away_id = game.away_team;
     away_team_name = await teams_utils.getTeamNameById(away_id);
     game.home_team = home_team_name.name;
     game.away_team = away_team_name.name;
     
     //retrieve all game events
     game_id = game.game_id
     game_events = await games.getGameEvents(game_id)
     game.events = game_events;
     
    
     //remove the game_id field since it is not compatible with our API
     delete game.game_id;
     return game;
  });
  let past_games_promise = await Promise.all(games_with_events);
  past_games_promise.map((game)=>{
     return{
        date: game.Date,
        time: game.time,
        home_team: game.home_team,
        away_team: game.away_team,
        field: game.field,
        home_goal: game.home_goal,
        away_goal: game.away_goal,
        event: game.events,
     }
  })

  future_games.map(async(game)=>{
     home_id = game.home_team;
     home_team_name = await teams_utils.getTeamNameById(home_id);
     away_id = game.away_team;
     away_team_name = await teams_utils.getTeamNameById(away_id);
     game.home_team = home_team_name.name;
     game.away_team = away_team_name.name;
     
     delete game.game_id;
  });
  let future_games_promise = await Promise.all(future_games);
  // getting all games' by teams' names.
  let all_games = {
  past_games: past_games_promise,
  future_games:future_games_promise
  }
  return all_games;
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
exports.getPastAndFutureGames = getPastAndFutureGames;
exports.getCurrentSeason = getCurrentSeason;
