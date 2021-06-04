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
      let all_teams_full_details = await axios.get(`https://soccer.sportmonks.com/api/v2.0/teams/season/${season_id}`,{
         params: {
           api_token: process.env.api_token,
         },
       });
      var team_previews = teams_utils.extractPreviewForSearch(all_teams_full_details.data.data);
      res.status(200).send(team_previews);
   }
   catch(error){
      next(error);
   }
});

router.get('/players', async(req, res,next) => {
   try{
      let all_teams_full_details = await axios.get(`https://soccer.sportmonks.com/api/v2.0/teams/season/${season_id}?include=squad.player`,{
         params: {
         //   include: squad.player,    
           api_token: process.env.api_token,
         },
      });     
      let list_toRet =[];
      let player_list = all_teams_full_details.data.data.map(async(team)=>{
         // console.log("heloo");
         let teamName = team.name;
         let player_info = (team.squad.data.map(async(player)=>{
            list_toRet.push( {
               fullname:player.player.data.fullname,
               picture: player.player.data.image_path,
               position: player.player.data.position_id,
               team: teamName
            })
         }))
         let names = await Promise.all(player_info)
         return names;
      });
      let list = await Promise.all(player_list);
      // console.log("heloo");
      res.status(200).send(list_toRet);
   }
   catch(error){
      next(error);
   }
});

module.exports = router;