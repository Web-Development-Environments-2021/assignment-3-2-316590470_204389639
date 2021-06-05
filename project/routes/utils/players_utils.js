const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require('./DButils');
const season_id = 17328;

/**function returns ids about a team's players
 * input:
 *    team_id: (int) team identifire
 * return"
 *    player_ids_list: ([int]) array of player ids of the players that play in the input team
 */
async function getPlayerIdsByTeam(team_id) {
  try{
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
  } catch(error){
    return 1;
  }
}
/**funtion returns deatails of a teams players
 * input:
 *    player_ids_list: ([int]) a list of a certain team's player Id's
 * return:
 *    ([JSON]) Array of player_preview objects of a teams players
 */
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

// returns a player's "Full info" accordind to API schema given a player id
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

/**function searches relavant player of partial or full match to a given query
 * input:
 *    playerList: ([JSON]) List of player object to search within
 *    player_name: (string) partial or full name of the player being searched
 *    player_team: (string) FILTER - name of the team a the player plays in
 *    player_position: (int) FILTER -  position a player plays in
 * return:
 *    playerList: ([JSON]) List of playerPreview object of all the relevant results return from the search
 */
function searchRelevantPlayers(playerList,player_name,player_team,player_position){
  // filter players if they are not the rifght position
  playerList = playerList.map((player)=>{
    if(player_position){
      if(player_position != player.position){
          return null;
      }
    }
    // filter player is they dont have the right name
    if(player_name){
      if(!player.fullname.toLowerCase().includes(player_name.toLowerCase())){
          return null;
      }
    }
    // filter players if they dont play fir the right team
    if(player_team){
      if(!player.team.toLowerCase().includes(player_team.toLowerCase())){
          return null;
      }
    }
    return player;
  });
  //filter all nulls from the list
 playerList = playerList.filter(player => player != null);
 return playerList;
}

/**main seach function
 * input:
 *    req: HTTP GET request
 * return:
 *    playerList: ([JSON]) array of player Previews objects of relevant player to the query
 */
async function search(req){
 
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

}


async function playerExists(player_id){
  try{
    const result = await axios.get(`${api_domain}/players/${player_id}`, {
      params: {
        api_token: process.env.api_token,
      },
    });
    if(result){
      return 0;
    }
    return 1;
  }catch(error){
    return 1;
  }
}
exports.getAllLeaguePlayers = getAllLeaguePlayers;
exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getPlayersInfoByName = getPlayersInfoByName;
exports.getPlayerFull = getPlayerFull;
exports.search = search;
exports.playerExists = playerExists;
