var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const teams_utils = require("./utils/teams_utils");
const DButils = require("../routes/utils/DButils");

// bonus - manage league page
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
    const all_legaue_games = await league_utils.getPastAndFutureGames(); // withdraw with getPastAndFutureGames from Guy.
    res.status(200).send(all_legaue_games);
  } catch(error){
    next(error);
  }
});

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

    if (user.user_type == 0){
      throw { status: 401, message: "Unauthorized" };
    }

    // valid parameters
    const { date, time, home_team, away_team, field } = req.body;
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
    if( !date || !time || !home_team || !away_team || !field)
      throw { status: 400, message: "Invalid syntax"}

    // check if teams exist in api's
    const home_team_exist = await teams_utils.getTeamNameById(home_team);
    const away_team_exist = await teams_utils.getTeamNameById(away_team);
    if(home_team_exist == 1 || away_team_exist == 1){
      throw { status: 400, message: "Invalid syntax"}
    }

    let games_id = await DButils.execQuery(
      'SELECT * FROM games'
    );
    games_id = games_id.length+1;
    
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

router.get('/current_games', async(req, res, next) => {
  try{
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "could not find the requested url"};
    }
    const all_games = await league_utils.getPastAndFutureGames();
    res.status(200).send(all_games);
  }catch(error){
    next(error);
  }
});

module.exports = router;
