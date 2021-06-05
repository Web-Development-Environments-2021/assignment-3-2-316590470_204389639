const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const DButils = require("./DButils");
const league =  require("./league_utils");
const games = require("./games_utils");
const season_Id = 17328 ;

/**this function returns info for a given list of teams
 * input:
 *      teams_ids_list: ([int]) array of team ids
 * return:
 *      ([JSON]) An array of team_preview objects for each team in original list
 */
async function getTeamsInfo(team_ids_list){
    let teams_promises = [];
    team_ids_list.map((team_id)=>{
        teams_promises.push( 
            axios.get(
            `https://soccer.sportmonks.com/api/v2.0/teams/${team_id}`,
            {
                params: {
                api_token: process.env.api_token,
                },
            }
        ));  
    });
    let teams = await Promise.all(teams_promises);
    return extractPreview(teams);
}

// Do I really need to explain this function?
async function getTeamNameById(team_id){
    const team = await axios.get(
        `https://soccer.sportmonks.com/api/v2.0/teams/${team_id}`,
        {
            params: {
            api_token: process.env.api_token,
            },
        }
    );
    return{
        name: team.data.data.name,
    }
}

/**this function iterates over all the games in the DB to find all previous anf future games of a given team
 * input:
 *      team_id: (int) A unique integer assigned to a team and identifies it
 * return:
 *      all_games: (JSON) object containing all of a team's past and future games ready to display      
 */
async function getPastAndFutureGames(team_id){
   //retriving all relevant games from the DB if existing
   let tdate = league.convertDate(new Date())
   let past_games = await DButils.execQuery(
      `select * from games
       where (home_team = '${team_id}' or away_team ='${team_id}')
       and (date <= '${tdate}' and home_goal is not NULL and away_goal is not NULL)
       order by date ASC, time ASC`);
       
   let future_games = await DButils.execQuery(
      `select game_id,date, time, home_team, away_team, field
       from games where (home_team = '${team_id}' or away_team ='${team_id}') 
       and (date >= '${tdate}' and home_goal is NULL and away_goal is NULL) 
       order by date ASC , time ASC`);
   
   
   // change the numeric team_id to the formal team name for both home and away teams
   let games_with_events = past_games.map(async(game)=>{
      home_id = game.home_team;
      home_team_name = await getTeamNameById(home_id);
      away_id = game.away_team;
      away_team_name = await getTeamNameById(away_id);
      game.home_team = home_team_name.name;
      game.away_team = away_team_name.name;
      
      //retrieve all game events
      game_id = game.game_id
      game_events = await games.getGameEvents(game_id)
      game.events = game_events;
      
     
      //remove the game_id field since it is not compatible with our API
      delete game.game_id;
      return game;
   });
   let past_games_promise = await Promise.all(games_with_events);
   past_games_promise.map((game)=>{
      return{
         date: game.Date,
         time: game.time,
         home_team: game.home_team,
         away_team: game.away_team,
         field: game.field,
         home_goal: game.home_goal,
         away_goal: game.away_goal,
         event: game.events,
      }
   })

   future_games.map(async(game)=>{
      home_id = game.home_team;
      home_team_name = await getTeamNameById(home_id);
      away_id = game.away_team;
      away_team_name = await getTeamNameById(away_id);
      game.home_team = home_team_name.name;
      game.away_team = away_team_name.name;
      
      delete game.game_id;
   });
   future_games_promise = await Promise.all(future_games);
   // getting all games' by teams' names.
   let all_games = {
   past_games: past_games_promise,
   future_games:future_games
   }
   return all_games;
}
function extractPreview(teams_list){
    return teams_list.map( (team) => {
        return {
            team_id: team.data.data.id,
            team_name: team.data.data.name,
            team_symbol: team.data.data.logo_path,
            team_twitter: team.data.data.twitter,
        }
    })
}

/** extract team name & symbol from the team's information */
function extractPreviewForSearch(teams_list){
   return teams_list.map( (team) => {
       return {          
           team_name: team.name,
           team_symbol: team.logo_path,          
       }
   })
}

/**get all teams that play in this league's season
 * input: none
 * return: ([JSON]) An array of team_preview object of the league's teams
*/
async function getAllLeagueTeams(){   
   let all_teams_full_details = await axios.get(`https://soccer.sportmonks.com/api/v2.0/teams/season/${season_Id}`,{
      params: {
         api_token: process.env.api_token,
      },
      });
   var team_previews = extractPreviewForSearch(all_teams_full_details.data.data);
   return team_previews;

}

/** search for a team with a partial or full fit to the input enterd in the query params 
 * input:
 *      req: HTTP GET request forwarded from router
 * return: team_previews ([JSON]) An array of team_preview object of the relevant search results
*/
async function search(req){
    
    let team_name = req.query.name;
    //retrieve all the leagues teams information
    let team_previews = await getAllLeagueTeams();
    // retrieve all relevant teams
    if(team_name){
        team_previews = team_previews.filter(team => team.team_name.toLowerCase().includes(team_name.toLowerCase()));
    }
    //if no results
    if (team_previews.length === 0 ){
        return("no teams");
    }

    return team_previews;

}

exports.search = search;
exports.getTeamsInfo = getTeamsInfo;
exports.extractPreviewForSearch = extractPreviewForSearch;
exports.getTeamNameById = getTeamNameById;
exports.getPastAndFutureGames = getPastAndFutureGames;
exports.getAllLeagueTeams = getAllLeagueTeams;