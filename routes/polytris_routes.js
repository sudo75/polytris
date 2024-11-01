const express = require('express');
const router = express.Router();
const polytris_controller = require('../controllers/polytris_controller');

router.post('/start', polytris_controller.start);
router.post('/reset', polytris_controller.reset);
router.post('/reqFrame', polytris_controller.reqFrame);
router.post('/setStatus', polytris_controller.setStatus);

router.post('/input/ArrowUp', polytris_controller.input_up);
router.post('/input/ArrowDown', polytris_controller.input_down);
router.post('/input/ArrowLeft', polytris_controller.input_left);
router.post('/input/ArrowRight', polytris_controller.input_right);
router.post('/input/space', polytris_controller.input_space);

module.exports = router;