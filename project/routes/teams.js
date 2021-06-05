var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const league = require("./utils/league_utils");
const teams_utils = require("./utils/teams_utils")

/*
* getting details about teamId:
  team info, entire players, past and future games.
*/
router.get("/:teamId/ticketDetails", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    let team_preview= await teams_utils.getTeamsInfo([req.params.teamId]);
    if( team_preview == 1){
      throw {status: 404, message: "Could not find the requested url"};
    }
    let all_games = await teams_utils.getPastAndFutureGames(req.params.teamId);
    const team_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    var toRet = {
      teamPreview: team_preview[0],
      teamFull:{
        players: team_details,
        games: all_games,
      }
    }
    //we should keep implementing team page.....
    res.status(200).send(toRet);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
