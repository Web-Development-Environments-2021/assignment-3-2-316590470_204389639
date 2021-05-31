var express = require("express");
const games_utils = require("./utils/games_utils");
const DButils = require("./utils/DButils");
var router = express.Router();

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

// bonus
router.post('/addResult', async (req, res, next) => {
    try{
        const game_id = req.body.game_id;
        const home_result = req.body.home_team_result;
        const away_result = req.body.away_team_result;
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
        ))[0];
        // check if have no permissions
        if( user.user_type == 0 ){
            throw { status: 401, message: "Unauthorized"}
        }
        // check if game already has a result
        const hasFinished = await games_utils.gameHasFinishedAlready(game_id);
        if( hasFinished == 1 ){
            throw { status: 409, message: "This game has a result already" };
        }
        // add result to game
        const success = await games_utils.addResultToGame(game_id, home_result, away_result);
    res.status(201).send("Result was added succesfully");
    } catch (error){
        next(error);
    }
});

// bounus
router.post('/addEvent', async (req, res, next) => {
  try{
    const game_id = req.body.game_id;
    const event_minute = req.body.minute;
    const event_desc = req.body.description;
    const user = (
      await DButils.execQuery(
          `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
    ))[0];
    // check if have no permissions
    if( user.user_type == 0 ){
        throw { status: 401, message: "Unauthorized"}
    }
    // check if game has finished
    const hasFinished = await games_utils.gameHasFinishedAlready(game_id);
    if( hasFinished == 1 ){
        throw { status: 409, message: "This game has finished already" };
    }
    // add event to game
    const success = await games_utils.addEventToGame(game_id, event_minute, event_desc);
    res.status(201).send("Event was added successfully");
  }catch(error){
    next(error);
  }
});

module.exports = router;