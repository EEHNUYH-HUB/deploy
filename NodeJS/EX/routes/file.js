const express = require('express');

const router = express.Router();

router.get('/file', (req, res) => {
    res.send('UPLOADER');
});
module.exports = router;
