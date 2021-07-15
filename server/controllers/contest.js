const asyncHandler = require('express-async-handler');
const Contest = require('../models/Contest');

// handler for creating a new contest object
exports.createContest = asyncHandler(async (req, res, next) => {
  const { title, description, user, prizeAmount, deadline } = req.body;

  const contest = await Contest.create({ title, description, prizeAmount, deadline });

  if (contest) {
    res.status(201).json(contest);
  } else {
    res.status(500);
    throw new Error('invalid contest data');
  }

  next();
});

// handler for updating a contest object
exports.updateContest = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { description, prizeAmount, title } = req.body;

  try {
    const contest = await Contest.findOneAndUpdate(
      { id: id },
      { title: title, description: description, prizeAmount: prizeAmount },
    );

    res.status(200).json(contest);
  } catch (error) {
    res.status(500);
    throw new Error('failed to update contest');
  }

  next();
});

// handler for getting a contest by providing the contest id
exports.getContest = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const contest = await Contest.findById(id);

    res.status(200).json(contest);
  } catch (error) {
    res.status(500);
    throw new Error(`failed to get contest by id: ${req.params.id}`);
  }
});

// handler for getting all the contests
exports.getContests = asyncHandler(async (req, res, next) => {
  try {
    const contests = await Contest.find({});
    res.status(200).json(contests);
  } catch (error) {
    res.status(500);
    throw new Error('failed to get contests');
  }
});