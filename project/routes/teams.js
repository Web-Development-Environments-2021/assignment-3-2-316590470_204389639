var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const league = require("./utils/league_utils");
const teams_utils = require("./utils/teams_utils")

/*
* getting details about teamId:
  entire players, past and future games.
*/
router.get("/:teamId/ticketDetails", async (req, res, next) => {
  let team_details = [];
  try {
   
    let all_games = await teams_utils.getPastAndFutureGames(req.params.teamId);
    const team_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    //we should keep implementing team page.....
    res.status(200).send([team_details , all_games]);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
