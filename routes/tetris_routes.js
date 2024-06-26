const express = require('express');
const router = express.Router();
const tetris_controller = require('../controllers/tetris_controller');

router.post('/start', tetris_controller.start);

module.exports = router;