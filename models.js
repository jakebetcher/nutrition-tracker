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
		date: {type: Date, default: Date.now}

});






goalSchema.methods.serialize = function() {
  return {
    id: this._id,
    calories: this.calories,
    fat: this.fat,
    protein: this.protein,
    carbs: this.carbs
    
  };
};

const Goal = mongoose.model('Goal', goalSchema);

module.exports = {Goal};

