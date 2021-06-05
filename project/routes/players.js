var express = require("express");
const players_utils = require("./utils/players_utils");
var router = express.Router();
/**
 * function return a detaild player information of a single player
 */
router.get('/:playerId/ticketDetails', async (req, res, next) => {
    try{
        const player_id = req.params.playerId;
        try{
            // get dtails of a single player
            var player_preview = await players_utils.getPlayersInfo([player_id]);
        } catch (error){
            throw { status: 404, message: "bad request"};
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