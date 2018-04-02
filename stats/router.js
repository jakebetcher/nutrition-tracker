'use strict';


const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('../config');
const { statObject } = require('./models');
const { User } = require('../users')

const router = express.Router();

const { localStrategy, jwtStrategy } = require('../auth');


const jsonParser = bodyParser.json();


passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res) => {
	function sendStats(stats) {
		res.json(stats);
	}

	statObject.returnGoalStats(req.user._id, sendStats);
})

module.exports = {router};