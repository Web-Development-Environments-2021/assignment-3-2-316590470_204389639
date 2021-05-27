const DButils = require("./DButils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into fav_players values ('${user_id}', ${player_id})`
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
    `insert into fav_games values ('${user_id}', ${game_id})`
  );
}

async function getFavoriteGames(user_id) {
  const game_ids = await DButils.execQuery(
    `select game_id from fav_games where user_id='${user_id}'`
  );
  return game_ids;
}

async function markTeamAsFavorite(user_id, team_id){
  await DButils.execQuery(
    `insert into fav_teams values ('${user_id}', ${team_id})`
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
