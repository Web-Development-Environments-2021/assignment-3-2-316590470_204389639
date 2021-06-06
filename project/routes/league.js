var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const teams_utils = require("./utils/teams_utils");
const DButils = require("../routes/utils/DButils");

/*
* this is a BONUS route for managing league,
  if any includes added to route then error is thrown,
  only user of user_type 1 is approved for such activity
*/
router.get('/manage', async (req, res, next) => {
  try{
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "could not find the requested url"};
    }
    // valid permissions
    if(!(req.session && req.session.user_id)){
      throw { status: 401, message: "Unauthorized" };
    }
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
      )
    )[0];

    if (user.user_type == 0){
      throw { status: 401, message: "Unauthorized" };
    }
    // retrieves all league's games
    const all_legaue_games = await league_utils.getPastAndFutureGames();
    res.status(200).send(all_legaue_games);
  } catch(error){
    next(error);
  }
});

/*
* this is a BONUS route for adding a new game to league,
  if any includes added to route then error is thrown,
  only user of user_type 1 is approved for such activity
*/
router.post("/addGame", async (req, res, next) => {
  try {
    // valid permissions
    if(!(req.session && req.session.user_id)){
      throw { status: 401, message: "Unauthorized" };
    }
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
      )
    )[0];
    // if user connected has no permissions
    if (user.user_type == 0){
      throw { status: 401, message: "Unauthorized" };
    }

    // valid parameters
    const { date, time, home_team, away_team, field } = req.body;

    if( !date || !time || !field || isNaN(home_team) || isNaN(away_team))
      throw { status: 400, message: "Invalid syntax"}

    if(!(typeof date === 'string' && typeof time === 'string' 
    && typeof home_team === 'number' && typeof away_team === 'number' 
    && typeof field === 'string') || !(Date.parse(date) && home_team >= 0 
    && away_team >= 0)){
      throw {status: 400, message: "Invalid syntax"};
    }
    
    // if date is smaller or equal to today's AND time is smaller than now - throw 400
    if(date <= league_utils.convertDate(new Date()) && time < league_utils.convertTime(new Date())){
      throw { status: 400, message: "Invalid syntax"}
    }

    // check if both teams exist in api's
    const home_team_exist = await teams_utils.getTeamNameById(home_team);
    const away_team_exist = await teams_utils.getTeamNameById(away_team);
    if(home_team_exist == 1 || away_team_exist == 1){
      throw { status: 400, message: "Invalid syntax"}
    }

    // if one of teams is playing the same date in another game
    const team_valid_on_date = await DButils.execQuery(
      `select * from games
       where 
       ((home_team = ${home_team} OR away_team = ${home_team}) AND date = ${date})
       OR
       ((home_team = ${away_team} OR away_team = ${away_team}) AND date = ${date}))
      `
      ) 
    if(team_valid_on_date){
      throw { status: 400, message: "Invalid syntax"}
    }

    let games_id = await DButils.execQuery(
      'SELECT * FROM games'
    );
    games_id = games_id.length+1; // next game_id for games_table
    
    // add the new game
    await DButils.execQuery(
      `INSERT INTO games (game_id, date, time, home_team, away_team, field, home_goal, away_goal)
       VALUES (${games_id}, '${date}', '${time}', '${home_team}', '${away_team}'
       , '${field}', NULL, NULL)`
    );
    res.status(201).send("game added");
  } catch (error) {
    next(error);
  }
});

/*
* this is part 9 from document, retrieves all details about current games = all games from db
  if any includes added to route then error is thrown
*/
router.get('/current_games', async(req, res, next) => {
  try{
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "could not find the requested url"};
    }
    // getting all games from db
    const all_games = await league_utils.getPastAndFutureGames();
    res.status(200).send(all_games);
  }catch(error){
    next(error);
  }
});

module.exports = router;
