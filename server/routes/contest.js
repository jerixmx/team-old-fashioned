const express = require('express');
const router = express.Router();
const { validateContest, validateUpdateContest, validateGetContest } = require('../validate');
const { createContest, updateContest, getContest, getContests } = require('../controllers/contest');

router.route('/').post(validateContest, createContest);
router.route('/all').get(getContests);
router.route('/:id').get(validateGetContest, getContest);
router.route('/:id').post(validateUpdateContest, updateContest);

module.exports = router;
