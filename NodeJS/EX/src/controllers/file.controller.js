const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");


dotenv.config();
const clientInstance = getClient();
const router = express.Router();

router.post('/upload', async (req, res) => {
    try {
        var result = await clientInstance.datatable(req.body.spName, req.body.spParams);
        res.send(result);
    }
    catch (ex) {
        res.send(ex);
    }
});


module.exports = router;