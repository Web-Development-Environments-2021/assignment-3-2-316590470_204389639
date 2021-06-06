var express = require("express");
const players_utils = require("./utils/players_utils");
var router = express.Router();

/**
 * route returns a detailed player information of a single player
 * if any includes added to route then error is thrown
 */
router.get('/:playerId/ticketDetails', async (req, res, next) => {
    try{
        if( Object.keys(req.query).length > 0 ){
            throw { status: 404, message: "could not find the requested url"};
        }
        const player_id = req.params.playerId;
        try{
            // get dtails of a single player
            var player_preview = await players_utils.getPlayersInfo([player_id]);
        } catch (error){
            // if player_id does not exist
            throw { status: 404, message: "Could not find the requested url"};
        }
        // get the full details of the player from the API
        const player_full = await players_utils.getPlayerFull(player_id);
        const player_merged = {
            player_preview: player_preview,
            player_full: player_full
        }
        res.status(200).send(player_merged);
    } catch (error){
        next(error);
    }
});

module.exports = router;