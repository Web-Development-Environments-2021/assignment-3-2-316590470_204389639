var express = require("express");
const players_utils = require("./utils/players_utils");
var router = express.Router();

router.get('/:playerId/ticketDetails', async (req, res, next) => {
    try{
        const player_id = req.params.playerId;
        const player_preview = await players_utils.getPlayersInfo([player_id]);
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