'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { User } = require('./users')
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
		username: { type: String},
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

const entrySchema = mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	//foodName: {type: String},
	consumedCalories: {type: Number, required: true},
	consumedFat: {type: Number, required: true},
	consumedProtein: {type: Number, required: true},
	consumedCarbs: {type: Number, required: true},
	date: {type: Date, required: true},
	day: {type: String, required: true}
});

const statSchema = mongoose.Schema({
	username: { type: String},
	timesMetCaloriesGoals: {type: Number, required: true},
	timesMetFatGoals: {type: Number, required: true},
	timesMetProteinGoals: {type: Number, required: true},
	timesMetCarbsGoals: {type: Number, required: true},
	timesMetAllGoals: {type: Number, required: true},
	timesMetAtLeastOneGoal: {type: Number, required: true},
	daysGoalsHaveBeenTracked: {type: Number, required: true}
});

function getGoals(id)  {
	
}

function getEntries(id, date) {

}

function summarizeEntries(id) {

 Entry
 .aggregate([
 		{
            $group: {
                _id: '$day',
                consumedCalories: {$sum: 1},
                consumedFat: {$sum: 1},
                consumedProtein: {$sum: 1},
                consumedCarbs: {$sum: 1}
            }
        },
 	],
 	function (err, result) {
        if (err) {
            next(err);
        } else {
            res.json(result);
        }
    });
}

function goalResults(id) {
	const goals = getGoals(id);
	const entries = getEntries(id);
}






goalSchema.methods.serialize = function() {
  return {
    _id: this._id,
    calories: this.calories,
    fat: this.fat,
    protein: this.protein,
    carbs: this.carbs,
    date: this.date
  };
};

const Goal = mongoose.model('Goal', goalSchema);
const Entry = mongoose.model('Entry', entrySchema);
const Stat = mongoose.model('Stat', statSchema);

module.exports = {Goal, Entry, Stat};

