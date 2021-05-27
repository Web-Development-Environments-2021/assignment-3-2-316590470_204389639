var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const league = require("./utils/league_utils");
const teams_utils = require("./utils/teams_utils")

router.get("/:teamId/ticketDetails", async (req, res, next) => {
  let team_details = [];

  try {

    let tdate = league.convertDate(new Date())
    let past_games = await DButils.execQuery(`select * from games where (home_team = '${req.params.teamId}' or away_team ='${req.params.teamId}') and date < '${tdate}' `);
    let future_games = await DButils.execQuery(`select * from games where (home_team = '${req.params.teamId}' or away_team ='${req.params.teamId}') and date >= '${tdate}'`);
    let all_games = {
      past_games: past_games,
      future_games:future_games
    }
    const team_details = await players_utils.getPlayersByTeam(
      req.params.teamId
    );
    //we should keep implementing team page.....
    res.send([team_details , all_games]);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
