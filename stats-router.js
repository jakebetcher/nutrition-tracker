'use strict';
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { statObject } = require('./models');
const { User } = require('./users')

const router = express.Router();


const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

app.use(morgan('common'));
app.use(bodyParser.json());


passport.use(localStrategy);
passport.use(jwtStrategy);


app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

app.use(express.static("public"));


const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/stats', jwtAuth, (req, res) => {
	function sendStats(stats) {
		res.json(stats);
	}

	statObject(req.user._id, sendStats);
})