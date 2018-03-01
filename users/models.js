'use strict'

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { Goal, Entry, Stat } = require('../models');

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	goals: { type: Schema.Types.ObjectId, ref: 'Goal' },
	entries: { type: Schema.Types.ObjectId, ref: 'Entry' },
	stats: { type: Schema.Types.ObjectId, ref: 'Stat' }
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    goals: this.goals,
    entries: this.entries,
    stats: this.stats
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};