//#region global imports
const DButils = require("./routes/utils/DButils");
const league_utils = require("./routes/utils/league_utils");
const user_utils = require("./routes/utils/users_utils");
const game_utils = require("./routes/utils/games_utils");
const axios = require("axios");
const bcrypt = require("bcryptjs");
require("dotenv").config();
//#endregion

//#region express configures
var express = require("express");
var path = require("path");
const session = require("client-sessions");
var logger = require("morgan");
var cors = require("cors");

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 24 hours
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    cookie: {
      httpOnly: false,
    },
    //the session will be extended by activeDuration milliseconds
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files

// middleware to serve all the needed static files under the dist directory - loaded from the index.html file
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("dist"));

app.get("/api", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

const port = process.env.PORT || "3000";

const auth = require("./routes/auth");
const users = require("./routes/users");
const league = require("./routes/league");
const teams = require("./routes/teams");
const players = require("./routes/players");
const games = require("./routes/games");
const search = require("./routes/search");

//#endregion

//#region cookie middleware
app.use(function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
  }
});
//#endregion

/**
 * this route gets home page of our league,
 * if any includes added to route then error is thrown
 */
app.get('/', async (req, res, next) => {
  try{
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    // get all league details
    const league_details = await league_utils.getLeagueDetails();
    let fav_games_details = null;

    // if there is a connected user then get all his favorite games
    if (req.session && req.session.user_id){
      const user_id = req.session.user_id;
      fav_games_details = await user_utils.getFavoriteGames(user_id);
      let top_3_games = "no favorite games were found";

      // if there are saved games as favorites then get at most 3
      if(fav_games_details != null){
        const num_fav_games = Object.keys(fav_games_details).length;
        if(num_fav_games < 3)
          top_3_games = fav_games_details.slice(0,num_fav_games);
        else
          top_3_games = fav_games_details.slice(0,3);
      }
      res.status(200).send([league_details,top_3_games]);
    }
  
    else{
      // no connected user
      res.status(200).send([league_details]);}
  } catch (error){
    next(error);
  }
});

// Routings
app.use("/users", users);
app.use("/league", league);
app.use("/teams", teams);
app.use("/players", players);
app.use("/games", games);
app.use("/search", search);
app.use(auth);

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send(err.message);
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

// process.on("SIGINT", function () {
//   if (server) {
//     server.close(() => console.log("server closed"));
//   }
// });
