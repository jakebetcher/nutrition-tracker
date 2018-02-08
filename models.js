'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const goalsSchema = mongoose.Schema({
	calories: {
		goalAmount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	fat: {
		goalAmount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	protein: {
		goalAmount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	carbs: {
		goalAmount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	allNutrients: {
		metAllGoals: Boolean: {type: Boolean, default: false},
		timesAllGoalsWereMet: {type: Number, default: 0}
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

