var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const games_utils = require("./utils/games_utils");
const teams_utils = require("./utils/teams_utils");

/**
 * Authenticate all incoming requests by middleware
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

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_id = req.body.id;
    if( !player_id || !(typeof player_id === 'number') || player_id < 0 || 
      (await players_utils.playerExists(player_id))==1){
      throw { status: 400, message: "Invalid syntax"};
    }
    await users_utils.markPlayerAsFavorite(user_id, player_id);
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites players that were saved by the logged-in user
 * if any includes added to route then error is thrown
 */
 router.get("/favoritePlayers", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    const user_id = req.session.user_id;
    let favorite_players = {};
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    // if there are no favorite players
    if( player_ids.length == 0 ){
      res.status(204).send("no favorite players were added");
    }else{
      let player_ids_array = [];
      player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
      const results = await players_utils.getPlayersInfo(player_ids_array);
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

/*
* This path gets body with teamId and saves this player in the favorites list of the logged in user.
*/
router.post("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_id = req.body.id;
    if( !team_id || !(typeof team_id === 'number') || team_id < 0 || 
      (await teams_utils.getTeamNameById(team_id))==1){
      throw { status: 400, message: "Invalid syntax"};
    }
    await users_utils.markTeamAsFavorite(user_id, team_id);
    res.status(201).send("The team successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites teams that were saved by the logged-in user
 * if any includes added to route then error is thrown
 */
 router.get("/favoriteTeams", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    const user_id = req.session.user_id;
    let favorite_teams = {};
    const team_ids = await users_utils.getFavoriteTeams(user_id);
    // if no teams were added
    if( team_ids.length == 0){
      res.status(204).send("no favorite teams were added");
    } else{
      let team_ids_array = [];
      team_ids.map((element) => team_ids_array.push(element.team_id)); //extracting the teams ids into array
      const results = await teams_utils.getTeamsInfo(team_ids_array); 
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

/*
* This path gets body with gameId and saves this game in the favorites list of the logged in user.
*/
router.post("/favoriteGames", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const game_id = req.body.id;
    if( !game_id || !(typeof game_id === 'number') || game_id < 0 || 
      (await games_utils.gameExists(game_id))==1){
      throw { status: 400, message: "Invalid syntax"};
    }
    const finished_game = await games_utils.gameHasFinishedAlready(game_id);
    if( finished_game != 3 ){
      throw { status: 400, message: "Invalid syntax"};
    }
    await users_utils.markGameAsFavorite(user_id, game_id);
    res.status(201).send("The game successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the favorites games that were saved by the logged-in user
 * if any includes added to route then error is thrown
 */
 router.get("/favoriteGames", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    const user_id = req.session.user_id;
    const results = await users_utils.getFavoriteGames(user_id);
    // if no games were added
    if( results.length == 0){
      res.status(204).send("No favorite games were added");
    } else{
      res.status(200).send(results);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
