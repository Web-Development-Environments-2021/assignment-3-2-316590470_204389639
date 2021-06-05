var express = require("express");
const players_utils = require("./utils/players_utils");
var router = express.Router();

router.get('/:playerId/ticketDetails', async (req, res, next) => {
    try{
        if( Object.keys(req.query).length > 0 ){
            throw { status: 404, message: "could not find the requested url"};
        }
        const player_id = req.params.playerId;
        try{
            var player_preview = await players_utils.getPlayersInfo([player_id]);
        } catch (error){
            throw { status: 404, message: "Could not find the requested url"};
        }
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