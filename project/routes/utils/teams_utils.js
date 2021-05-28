const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";

async function getTeamsInfo(team_ids_list){
    
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

exports.getTeamsInfo = getTeamsInfo;
exports.getTeamNameById = getTeamNameById;