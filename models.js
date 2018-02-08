'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const goalsSchema = mongoose.Schema({
	calories: {
		goal-amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumed-amount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false}
	},
	fat: {
		goal-amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumed-amount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false}
	},
	protein: {
		goal-amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumed-amount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false}
	},
	carbs: {
		goal-amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumed-amount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false}
	}
});


goalsSchema.methods.serialize = function() {
  return {
    id: this._id,
    calories: this.calories,
    fat: this.fat,
    protein: this.protein,
    carbs: this.carbs
  };
};

const Goals = mongoose.model('Goals', goalSchema);

module.exports = {Goals};

