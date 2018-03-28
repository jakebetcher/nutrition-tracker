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
	lastName: {type: String, required: true}
	/*goals: {
		calories: {
			amount: {type: Number, default: 0},
			range: {type: Number, default: 0}
		},
		fat: {
			amount: {type: Number, default: 0},
			range: {type: Number, default: 0}
		},
		protein: {
			amount: {type: Number, default: 0},
			range: {type: Number, default: 0}
		},
		carbs: {
			amount: {type: Number, default: 0},
			range: {type: Number, default: 0}
		},
		startDate: {type: Date, default: Date.now}
	}*/
});

UserSchema.methods.serialize = function() {
  return {
  	id: this.id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
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