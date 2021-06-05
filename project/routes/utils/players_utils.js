const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils');
const season_id = 17328;

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}

async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}

async function getPlayersInfoByName(players_names_list) {
  let promises = [];
  players_names_list.map((name) =>
    promises.push(
      axios.get(`${api_domain}/players/search/${name.name}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  //return(players_info);
 return extractRelevantPlayerDataByName(players_info[0].data.data);
}

function extractRelevantPlayerDataByName(players_info) {
  console.log(players_info);
  return players_info.map((player_info) => {
    console.log(player_info)
    const { fullname, image_path, position_id } = player_info;
    if ('team' in player_info){
      const { name } = player_info.team.data;
      return {
        name: fullname,
        image: image_path,
        position: position_id,
        team_name: name ,
      };
    }
    else{
      return {
        name: fullname,
        image: image_path,
        position: position_id,
        team_name: 'No Team' ,
      };
    }
  });
}

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}


async function getPlayerFull(player_id){
  const player_full = await axios.get(`${api_domain}/players/${player_id}`, {
    params: {
      api_token: process.env.api_token,
    },
  });
  return{
    common_name: player_full.data.data.common_name,
    nationality: player_full.data.data.nationality,
    birth_date: player_full.data.data.birthdate,
    birth_country: player_full.data.data.birthcountry,
    height: player_full.data.data.height,
    weight: player_full.data.data.weight,
  };
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}

// async function searchPlayerInDB(name){
//   let player_names =( 
//     await DButils.execQuery(`select name from players where name LIKE '%${name}%'`
//   ));
//   return player_names;
// }

async function getAllLeaguePlayers(season_id){

  let all_teams_full_details = await axios.get(`https://soccer.sportmonks.com/api/v2.0/teams/season/${season_id}?include=squad.player`,{
      params: {   
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
  return list_toRet;
}

function searchRelevantPlayers(playerList,player_name,player_team,player_position){
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
 return playerList;
}

async function search(req){
  // try{
      
    let player_name = req.query.name;
    let player_team = req.query.team_name;
    let player_position = req.query.position;      
    let playerList = await getAllLeaguePlayers(season_id);
    
    if(player_position || player_name || player_team){

       playerList = searchRelevantPlayers(playerList,player_name,player_team,player_position);
       
    }
    if(playerList.length === 0 ){
      return("no players")
    }
    return playerList ;
//  }
//  catch(error){
//     next(error);
//  }
}

exports.getAllLeaguePlayers = getAllLeaguePlayers;
exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayersInfoByName = getPlayersInfoByName;
exports.getPlayerFull = getPlayerFull;
exports.search = search;
