'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('../config');
const { Goal } = require('../goals');
const { Entry } = require('./models');
const { User } = require('../users');

const router = express.Router();

const { localStrategy, jwtStrategy } = require('../auth');


const jsonParser = bodyParser.json();


passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', jsonParser, jwtAuth, (req, res) => {
  const requiredFields = ['foodName', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs', 'date', 'day'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  
  console.log(req.user._id);

  Goal
  .find({user: req.user._id})
  .sort({"date": -1})
  .limit(1)
  .then(theGoal => {
    
    let entry = new Entry({
    goal: theGoal[0]._id,
    user: req.user._id,
    foodName: req.body.foodName,
    consumedCalories: req.body.consumedCalories,
    consumedFat: req.body.consumedFat,
    consumedProtein: req.body.consumedProtein,
    consumedCarbs: req.body.consumedCarbs,
    date: req.body.date,
    day: req.body.day

  });

  entry.save();
  return entry;
})
  .then(entry => res.status(201).json(entry))
  .catch(err => {
    console.log(err);

    res.status(500).json({error: 'Something went horribly wrong'});
  })
});



router.get('/list', jwtAuth, (req, res) => {
  const theDate = new Date();
  const day = theDate.toDateString();

  Goal.find({user: req.user._id})
  .sort({date: -1})
  .limit(1)
  .then(goal => {

    return Entry
    .find({user: req.user._id})
    .where({goal: goal[0]._id})
    .where({day: day})
  })
  .then(entry => {
    res.json(entry);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: 'Something went horribly wrong'})
  })
});

router.get('/total', jwtAuth, (req, res) => {
  const theDate = new Date();
  const day = theDate.toDateString();

  Goal.find({user: req.user._id})
  .sort({date: -1})
  .limit(1)
  .then(goal => {
    return Entry.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
          goal: mongoose.Types.ObjectId(goal[0]._id),
          day: day
        }
      },
      {
        $group: {
          _id: '$day',
          consumedCalories: {$sum: "$consumedCalories"},
          consumedFat: {$sum: "$consumedFat"},
          consumedProtein: {$sum: "$consumedProtein"},
          consumedCarbs: {$sum: "$consumedCarbs"}
        }
      }
      ],

      function (err, result) {
        if (err) {
          console.log(err);
          return;
        }
        let theResult = result;
        let caloriesGoalLowerBound = goal[0].calories.amount - goal[0].calories.range;
        console.log(goal[0].calories.amount);
        console.log(goal[0].calories.range);
        console.log(goal[0].calories.amount - goal[0].calories.range);
        console.log(caloriesGoalLowerBound);
        let caloriesGoalUpperBound = goal[0].calories.amount + goal[0].calories.range;
        let fatGoalLowerBound = goal[0].fat.amount - goal[0].fat.range;
        let fatGoalUpperBound = goal[0].fat.amount + goal[0].fat.range;
        let proteinGoalLowerBound = goal[0].protein.amount - goal[0].protein.range;
        let proteinGoalUpperBound = goal[0].protein.amount + goal[0].protein.range;
        let carbsGoalLowerBound = goal[0].carbs.amount - goal[0].carbs.range;
        let carbsGoalUpperBound = goal[0].carbs.amount + goal[0].carbs.range;

        
        if (result.length === 0) {
          res.json(result);
        } else {
          if ((result[0].consumedCalories >= caloriesGoalLowerBound) && (result[0].consumedCalories <= caloriesGoalUpperBound)) {
          result[0].caloriesResult = true;
        } else {
          result[0].caloriesResult = false;
        }

        if ((result[0].consumedFat >= fatGoalLowerBound) && (result[0].consumedFat <= fatGoalUpperBound)) {
          result[0].fatResult = true;
        } else {
          result[0].fatResult = false;
        }

        if ((result[0].consumedProtein >= proteinGoalLowerBound) && (result[0].consumedProtein <= proteinGoalUpperBound)) {
          result[0].proteinResult = true;
        } else {
          result[0].proteinResult = false;
        }

        if ((result[0].consumedCarbs >= carbsGoalLowerBound) && (result[0].consumedCarbs <= carbsGoalUpperBound)) {
          result[0].carbsResult = true;
        } else {
          result[0].carbsResult = false;
        }
        res.json(result);
        }
      });

});
});



router.delete('/:id', jwtAuth, (req, res) => {
  Entry
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

module.exports = {router};