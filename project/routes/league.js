var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const DButils = require("../routes/utils/DButils");

router.get("/getDetails", async (req, res, next) => {
  try {
    const league_details = await league_utils.getLeagueDetails();
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

router.post("/addGame", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    const { date, time, home_team, away_team, field } = req.body;

    if( !date || !time || !home_team || !away_team || !field)
      throw { status: 400, message: "Bad input"}

    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE user_id = '${req.session.user_id}'`
      )
    )[0];

    if (user.user_type == 0){
      throw { status: 401, message: "Unauthorized" };
    }

    // add the new game
    await DButils.execQuery(
      `INSERT INTO games (date, time, home_team, away_team, field, home_goal, away_goal, event)
       VALUES ('${date}', '${time}', '${home_team}', '${away_team}'
       , '${field}', NULL, NULL, NULL)`
    );
    res.status(201).send("game added");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
