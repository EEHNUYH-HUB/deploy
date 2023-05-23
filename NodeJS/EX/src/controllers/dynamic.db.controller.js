const express = require("express");
const { getClient } = require("../dbAccess/client.factory.js");
const clientInstance = getClient();
const router = express.Router();
router.post('/fill', async (req, res) => {
    try {
        const spName = req.body.spName;
        const spParams = req.body.spParams;

        
        var result = await clientInstance.fill(spName, spParams);
        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});


module.exports = router;