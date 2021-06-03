const DButils = require("./DButils");
const games_utils = require("./games_utils");
const league_utils = require("./league_utils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into fav_players (user_id, player_id)
    select '${user_id}', ${player_id}
    where not exists 
    (select * from fav_players
    where (user_id = '${user_id}' and player_id = ${player_id}));`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from fav_players where user_id='${user_id}'`
  );
  return player_ids;
}

async function markGameAsFavorite(user_id, game_id){
  await DButils.execQuery(
    `insert into fav_games (user_id, game_id)
    select '${user_id}', ${game_id}
    where not exists 
    (select * from fav_games
    where (user_id = '${user_id}' and game_id = ${game_id}));`
  );
}

async function getFavoriteGames(user_id) {
  // getting all favorite games ids and deleting all occured favorite games.
  const game_ids = await DButils.execQuery(
    `
    delete from fav_games where game_id in (
      select game_id from games
      where (date <= '${league_utils.convertDate(new Date())}' AND home_goal is not NULL AND away_goal is not NULL)
    ); 
    
    select game_id from fav_games where user_id='${user_id}'`
  );
  // no games were found, return null
  if(game_ids.length==0){ return null;}

  let game_ids_array = [];
  game_ids.map((element) => game_ids_array.push(element.game_id)); //extracting the games ids into array
  const results = await games_utils.getGamesInfo(game_ids_array); 
  return results;
}

async function markTeamAsFavorite(user_id, team_id){
  await DButils.execQuery(
    `insert into fav_teams (user_id, team_id)
    select '${user_id}', ${team_id}
    where not exists 
    (select * from fav_teams
    where (user_id = '${user_id}' and team_id = ${team_id}));`
  );
}

async function getFavoriteTeams(user_id) {
  const team_ids = await DButils.execQuery(
    `select team_id from fav_teams where user_id='${user_id}'`
  );
  return team_ids;
}

exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.markGameAsFavorite = markGameAsFavorite;
exports.getFavoriteGames = getFavoriteGames;
exports.markTeamAsFavorite = markTeamAsFavorite;
exports.markTeamAsFavorite = getFavoriteTeams;
exports.getFavoriteTeams = getFavoriteTeams;
