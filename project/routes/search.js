var express = require("express");
const axios = require("axios");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const DBUtils = require("./utils/DButils");
const league_utils = require("./utils/league_utils");
var router = express.Router();


/**
 * search for a specific team by name.
 * no filters relevant for this query
 * if a user is logged in- save results to session memory.
 */
router.get('/teams', async(req, res,next) => {
   try{
      //check that URL is valid
      for( value in req.query){
         if(value != "name"){
            throw {status:404, message:"could not find URL"}
         }
      }
      let team_previews = await teams_utils.search(req);
      //  if logged in  - save to memory
      session = req.session; 
      if(session){
         session.last_search = team_previews;
      }
      // if no results
      if(team_previews == "no teams"){
         res.status(204).send("")
      }else{
         res.status(200).send(team_previews);
      }
      
   }
   catch(error){
      next(error);
   }
});

/**
 * searching specifically for players:
 * can be filtered by {name: player name , position: the position a player playes in,
 *  team_name: the team a player plays for}
 * if a user is logged in - save results to session memory
 */
router.get('/players', async(req, res,next) => {
   try{
      //check that URL is valid 
      for( value in req.query){
         if(value != "name" && value != "position" && value != "team_name"){
            throw {status:404, message:"could not find URL"}
         }
      }
      
      let playerList = await players_utils.search(req);
      // if logged in - save to memory
      let session = req.session;
      if(session){
         session.last_search = playerList;
      }
      //if no results
      if(playerList == "no players"){
         res.status(204).send("No results");
      }else{
      res.status(200).send(playerList);
      }
   }
   catch(error){
      next(error);
   }
});

/* 
main search page: 
if exist prev search - display prev searc
else if exist name param - display search results
else - display all teams and players info
*/
router.get('/', async(req, res, next) => {
   try{
      for( value in req.query){
         if(value != "name"){
            throw {status:404, message:"could not find URL"}
         }
      }
      // search league for relevant matches
      let session = req.session;
      if(req.query.name){
         let teams =await teams_utils.search(req);
         let players =await players_utils.search(req);
         let info = {
            teams: teams,
            players: players,
         }
         //if no results returned 
         if(teams == "no teams" && players == "no players"){
            res.status(204).send("");
         }else{
            res.status(200).send(info);
         }
      }
      
     
      // default when no paramater or prev searches
      let teams = await teams_utils.getAllLeagueTeams();
      let season_id = await  league_utils.getCurrentSeason();  
      let players = await players_utils.getAllLeaguePlayers(season_id);

      info = {
         teams: teams,
         players: players,
      }
      res.status(200).send(info);
   }
   catch(error){
      next(error);
   }
});

module.exports = router;