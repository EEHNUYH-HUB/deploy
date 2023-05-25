const express = require("express");
const { getClient } = require("../dbAccess/client.factory.js");
const dotenv = require("dotenv");
dotenv.config();
const clientInstance = getClient();
const router = express.Router();


router.get('/', (req, res) => {
    res.send(process.env.NODE_ENV);
})

router.post('/datatable', async (req, res) => {
    try {
        var result = await clientInstance.datatable(req.body.spName, req.body.spParams);
        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});

router.post('/dataset', async (req, res) => {
    try {
        var result = await clientInstance.dataset(req.body.spName, req.body.spParams);
        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});
router.post('/execute', async (req, res) => {
    try {
        var result = await clientInstance.execute(req.body.spName, req.body.spParams);
        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});
router.post('/scalar', async (req, res) => {
    try {
        var result = await clientInstance.scalar(req.body.spName, req.body.spParams);

        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});


module.exports = router;