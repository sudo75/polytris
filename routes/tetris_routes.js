const express = require('express');
const router = express.Router();
const tetris_controller = require('../controllers/tetris_controller');

router.post('/start', tetris_controller.start);
router.post('/reqFrame', tetris_controller.reqFrame);

router.post('/input/ArrowUp', tetris_controller.input_up);
router.post('/input/ArrowDown', tetris_controller.input_down);
router.post('/input/ArrowLeft', tetris_controller.input_left);
router.post('/input/ArrowRight', tetris_controller.input_right);

module.exports = router;