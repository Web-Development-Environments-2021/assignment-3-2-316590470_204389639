const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

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

exports.getTeamsInfo = getTeamsInfo;
exports.getTeamNameById = getTeamNameById;