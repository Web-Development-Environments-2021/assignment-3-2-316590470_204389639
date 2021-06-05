var express = require("express");
const axios = require("axios");
const players_utils = require("./utils/players_utils");
const teams_utils = require("./utils/teams_utils");
const DBUtils = require("./utils/DButils");
const { Router } = require("express");
var router = express.Router();
const season_id = 17328;

router.get('/teams', async(req, res,next) => {
   try{
      for( value in req.query){
         if(value != "name"){
            throw {status:404, message:"could not find URL"}
         }
      }
      let team_previews = await teams_utils.search(req);
      
      session = req.session; 
      if(session){
         session.last_search = team_previews;
      }
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

router.get('/players', async(req, res,next) => {
   try{
      for( value in req.query){
         if(value != "name" && value != "position" && value != "team_name"){
            throw {status:404, message:"could not find URL"}
         }
      }
      
      let playerList = await players_utils.search(req);

      let session = req.session;
      if(session){
         session.last_search = playerList;
      }
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

router.get('/', async(req, res, next) => {
   try{
      for( value in req.query){
         if(value != "name"){
            throw {status:404, message:"could not find URL"}
         }
      }

      let session = req.session;

      if(req.query.name){
         let teams =await teams_utils.search(req);
         let players =await players_utils.search(req);
         let info = {
            teams: teams,
            players: players,
         }
         if(teams == "no teams" && players == "no players"){
            res.status(204).send("");
         }else{
            res.status(200).send(info);
         }
      }
      else if(session){
         if (session.last_search){
            res.status(200).send(session.last_search);
         }
      }
      else {
         let teams = await teams_utils.getAllLeagueTeams();
         let players = await players_utils.getAllLeaguePlayers(season_id);

      info = {
         teams: teams,
         players: players,
      }
      res.status(200).send(info);}
   }
   catch(error){
      next(error);
   }
});

module.exports = router;