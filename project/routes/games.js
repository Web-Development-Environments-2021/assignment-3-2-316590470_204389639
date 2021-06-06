var express = require("express");
const games_utils = require("./utils/games_utils");
const DButils = require("./utils/DButils");
var router = express.Router();

/*
authenticating all incoming requests by middleware
*/
router.use(async function (req, res, next) {
    if (req.session && req.session.user_id) {
      DButils.execQuery("SELECT user_id FROM users")
        .then((users) => {
          if (users.find((x) => x.user_id === req.session.user_id)) {
            req.user_id = req.session.user_id;
            next();
          }
        })
        .catch((err) => next(err));
    } else {
      res.sendStatus(401);
    }
  });

/*
* this is a BONUS route for adding a result to league's game,
  if any includes added to route then error is thrown,
  only user of user_type 1 is approved for such activity
*/
router.post('/addResult', async (req, res, next) => {
    try{
        const game_id = req.body.game_id;
        const home_result = req.body.home_team_result;
        const away_result = req.body.away_team_result;
        // valid parameters
        if(isNaN(game_id) || isNaN(home_result) || isNaN(away_result)
         || !(typeof game_id === "number" && typeof home_result === "number" && typeof away_result === "number") ||
          (game_id<0 || home_result<0 || away_result<0)){
          throw { status: 400, message: "Invalid syntax"};
        }
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
        ))[0];
        // check if have no permissions
        if( user.user_type == 0 ){
            throw { status: 401, message: "Unauthorized"}
        }
        // check if game already has finished or is a future game
        const valid_game = await games_utils.gameHasFinishedAlready(game_id);
        if( valid_game !=0 ){
            throw { status: 409, message: "Found conflict" };
        }
        // add result to game
        const success = await games_utils.addResultToGame(game_id, home_result, away_result);
    res.status(201).send("Result was added succesfully");
    } catch (error){
        next(error);
    }
});

/*
* this is a BONUS route for adding a new event to league's game,
  if any includes added to route then error is thrown,
  only user of user_type 1 is approved for such activity
*/
router.post('/addEvent', async (req, res, next) => {
  try{
      const game_id = req.body.game_id;
      const event_minute = req.body.minute;
      const event_desc = req.body.description;

      // valid parameters
      if(isNaN(game_id) || isNaN(event_minute) || !(event_desc) || isNaN(event_desc.player_id)
       || !(event_desc.event_type) || !(typeof game_id === "number" && typeof event_minute === "number"
       && typeof event_desc.player_id === "number" && typeof event_desc.event_type === "string")
       || (game_id < 0 || event_minute < 0 || event_desc.player_id < 0)){
        throw { status: 400, message: "Invalid syntax"};
      }

      const user = (
        await DButils.execQuery(
            `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
      ))[0];
      // check if have no permissions
      if( user.user_type == 0 ){
          throw { status: 401, message: "Unauthorized"}
      }
      // check if game has finished or is a future game
      const valid_game = await games_utils.gameHasFinishedAlready(game_id);
      if( valid_game != 0){
        throw { status: 400, message: "Bad request" };
      }
      // add event to game
      const success = await games_utils.addEventToGame(game_id, event_minute, event_desc);

    res.status(201).send("Event was added successfully");

  }catch(error){
    next(error);
  }
});

module.exports = router;