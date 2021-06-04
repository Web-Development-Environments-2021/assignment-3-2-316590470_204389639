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
      let team_name = req.query.team_name;
      

      let team_previews = await teams_utils.getAllLeagueTeams();
      if(team_name){
         team_previews = team_previews.filter(team => team.team_name.toLowerCase().includes(team_name.toLowerCase()));
      }
      if (team_previews.length === 0 ){
         res.status(204).send("no results")
      }
      res.status(200).send(team_previews);
   }
   catch(error){
      next(error);
   }
});

router.get('/players', async(req, res,next) => {
   try{
      let player_name = req.query.player_name;
      let player_team = req.query.team_name;
      let player_position = req.query.position;      
      let playerList = await players_utils.getAllLeaguePlayers(season_id);
      
      if(player_position || player_name || player_team){
         playerList = playerList.map((player)=>{
            if(player_position){
               if(player_position != player.position){
                  return null;
               }
            }
            if(player_name){
               if(!player.fullname.toLowerCase().includes(player_name.toLowerCase())){
                  return null;
               }
            }
            if(player_team){
               if(!player.team.toLowerCase().includes(player_team.toLowerCase())){
                  return null;
               }
            }
            return player;
         });
         playerList = playerList.filter(player => player != null);
         if(playerList.length === 0){
            res.status(204).send("No results");
         }
      }
      res.status(200).send(playerList);


   }
   catch(error){
      next(error);
   }
});

router.get('/', async(req, res, next) => {
   try{
      let teams = await teams_utils.getAllLeagueTeams();
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