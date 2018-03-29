'use strict';
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Goal } = require('./models');
const { User } = require('./users')

const router = express.Router();

const { localStrategy, jwtStrategy } = require('./auth');


const jsonParser = bodyParser.json();


passport.use(localStrategy);
passport.use(jwtStrategy);


const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', jsonParser, jwtAuth, (req, res) => {

const requiredFields = ['calories', 'fat', 'protein', 'carbs'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  
  let goal = new Goal({
    user: req.user._id,
    calories: {
    	amount: req.body.calories.amount,
    	range: req.body.calories.range
    },
    fat: {
    	amount: req.body.fat.amount,
    	range: req.body.fat.range
    },
    protein: {
    	amount: req.body.protein.amount,
    	range: req.body.protein.range
    },
    carbs: {
    	amount: req.body.carbs.amount,
    	range: req.body.carbs.range
    }
   });

   goal.save()
   .then(goal => res.status(201).json(goal))
   .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    }); 
});


router.get('/', jwtAuth, (req, res) => {
	Goal
	.find({user: req.user._id})
	.sort({date: -1})
  	.limit(1)
	.then(goal => {
		res.json(goal);
	})
	.catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

module.exports = {router};

