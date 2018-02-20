'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/*const goalSchema = mongoose.Schema({
	calories: {
		goalAmount: {type: Number, default: 0},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	fat: {
		goalAmount: {type: Number, default: 0},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	protein: {
		goalAmount: {type: Number, default: 0},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	carbs: {
		goalAmount: {type: Number, default: 0},
		range: {type: Number, default: 0},
		consumedAmount: {type: Number, default: 0},
		metGoal: {type: Boolean, default: false},
		timesGoalsWereMet: {type: Number, default: 0}
	},
	allNutrients: {
		metAllGoals: {type: Boolean, default: false},
		metAtLeastOneGoal: {type: Boolean, default: false},
		timesAllGoalsWereMet: {type: Number, default: 0},
		timesAtLeastOneGoalWasMet: {type: Number, default: 0},
		daysGoalsHaveBeenTracked: {type: Number, default: 0}
	}
});*/

const goalSchema = mongoose.Schema({
	
		calories: {type: Number}

});





goalSchema.methods.serialize = function() {
  return {
    id: this._id,
    calories: this.calories
    
  };
};

const Goal = mongoose.model('Goal', goalSchema);

module.exports = {Goal};

