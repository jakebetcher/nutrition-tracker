'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const entrySchema = mongoose.Schema({
	goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	foodName: {type: String, required: true},
	consumedCalories: {type: Number, required: true},
	consumedFat: {type: Number, required: true},
	consumedProtein: {type: Number, required: true},
	consumedCarbs: {type: Number, required: true},
	date: {type: Date, required: true},
	day: {type: String, required: true}
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = {Entry};