const axios = require("axios");
const DButils = require("./DButils");
const games_utils = require("./games_utils");
const teams_utils = require("./teams_utils");
const games = require("./games_utils");
const LEAGUE_ID = 271;

/*
* this function returns current season id of league 271
  input: none,
  return: (int) current_season_id 
*/
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

/*
* this function returns all details about league 271,
  input: none,
  return: a json type for league details {
    league name
    current season name,
    current stage name,
    next game details
  }
*/
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
  const current_time = convertTime(new Date());
  const next_game = (   
    await DButils.execQuery(
      `SELECT TOP 1 game_id, date, time, home_team, away_team, field FROM games
       WHERE (date > '${tdate}') or (date = '${tdate}' and time >= '${current_time}')
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
    next_game_details_id: next_game_details.game_id,
    next_game_details_date: next_game_details.date,
    next_game_details_time: next_game_details.time,
    next_game_details_home_team: next_game_details.home_team,
    next_game_details_away_team: next_game_details.away_team,
    next_game_home_logo: next_game_details.home_team_logo,
    next_game_away_logo: next_game_details.away_team_logo,
    next_game_details_field: next_game_details.field, 
  };
  return temp;
}

/*
* this function retrieves all games in league,
  input: none,
  return: two json objects, one for past games and second for future games according to api scehmas
*/
async function getPastAndFutureGames(req){
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
  // if there is a user logged in' need to get his favorites
  let favorite_games = null;
  if(req.session && req.session.user_id){
    favorite_games =   await DButils.execQuery(
      `select game_id from fav_games 
      where user_id  =  '${req.session.user_id}'`
    );
  }
  

  // change the numeric team_id to the formal team name for both home and away teams
  games_with_events = [];
    for(let i =0; i< past_games.length;i++){
        const details = await teams_utils.getGameDetails(past_games[i]);
        games_with_events.push(details);
    }
  let past_games_promise = await Promise.all(games_with_events);

  future_games_final = [];
  for(let i =0; i< future_games.length;i++){
      const details = await teams_utils.getFutureGameDetails(future_games[i]);
      future_games_final.push(details);
  }
  let future_games_promise = await Promise.all(future_games_final);

  if(favorite_games){
    for(let i =0; i< future_games_promise.length;i++) {
      if( favorite_games.some(item => item.game_id === future_games_promise[i].game_id)){
      // if (favorite_games.has({game_id:future_games_promise[i].game_id})){
        future_games_promise[i].favorite = true;
      }else{
        future_games_promise[i].favorite = false;
      }
    };
  }
  
  // getting all games' by teams' names.
  let all_games = {
  past_games: past_games_promise,
  future_games:future_games_promise
  }
  return all_games;
}

/*
* this function transfer a date to next format: YYYY-MM-DD
  input: (Date) date,
  return: (string) date of type "yyyy-mm-dd"
*/
function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

/*
* this function transfer a time to next format: HH:MM:SS
  input: (Date) date,
  return: (string) time of type "hh:mm:ss"
*/
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
