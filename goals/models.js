'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const goalSchema = mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	calories: {
		amount: {type: Number, required: true, default: 0},
		range: {type: Number, required: true, default: 0}
	},
	fat: {
		amount: {type: Number, required: true, default: 0},
		range: {type: Number, required: true, default: 0}
	},
	protein: {
		amount: {type: Number, required: true, default: 0},
		range: {type: Number, required: true, default: 0}
	},
	carbs: {
		amount: {type: Number, required: true, default: 0},
		range: {type: Number, required: true, default: 0}
	},
	date: {type: Date, default: Date.now}
});

const Goal = mongoose.model('Goal', goalSchema);

module.exports = {Goal};