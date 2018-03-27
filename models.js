'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { closeServer, runServer, app } = require('./server');
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

const Goal = mongoose.model('Goal', goalSchema);
const Entry = mongoose.model('Entry', entrySchema);
const Stat = mongoose.model('Stat', statSchema);


function getGoals(id)  {
	User
	.find({_id: id})
	.exec(function(err, user) {
		if (err) return handleError(err);
		return user;
	});
	
	
}

//console.log(getGoals('5ab937ecd6cc5883b9bfd8ef'));

/*function a() {
let goals = getGoals('5ab937ecd6cc5883b9bfd8ef');
console.log(goals);
}

a();*/

function getEntries(id, date) {

}

function summarizeEntries(id) {
	Entry.aggregate([
 		{
 			$match: {
 				user: mongoose.Types.ObjectId(id) 
 			}
 		},
 		{
            $group: {
                _id: '$day',
                consumedCalories: {$sum: "$consumedCalories"},
                consumedFat: {$sum: "$consumedFat"},
                consumedProtein: {$sum: "$consumedProtein"},
                consumedCarbs: {$sum: "$consumedCarbs"}
            }
        }],
        
		function (err, result) {
        	if (err) {
            	console.log(err);
            	return;
        	}
        console.log(result);
        goalResults(id, result);
    });
}

summarizeEntries("5ab96dfb2c4f1b8619a875f8");

function goalResults(id, results) {
	User.findOne({_id: id})
	.exec(function(err, user) {
		if (err) console.log(err);
		let goals = user.goals;
		let timesMetCaloriesGoals = 0;
		let timesMetFatGoals = 0;
		let timesMetProteinGoals= 0;
		let timesMetCarbsGoals = 0;
		let timesMetAllGoals = 0;
		let timesMetAtLeastOneGoal = 0;
		let daysGoalsHaveBeenTracked = 0;

		results.forEach(result => {
			let metCalorieGoals;
			let metFatGoals;
			let metProteinGoals;
			let metCarbsGoals;
			if ((result.consumedCalories >= goals.calories.amount - goals.calories.range) && (result.consumedCalories <= goals.calories.amount + goals.calories.range)) {
				timesMetCaloriesGoals += 1;
				metCalorieGoals = true;
			}

			if ((result.consumedFat >= goals.fat.amount - goals.fat.range) && (result.consumedFat <= goals.fat.amount + goals.fat.range)) {
				timesMetFatGoals += 1;
				metFatGoals = true;
			}

			if ((result.consumedProtein >= goals.protein.amount - goals.protein.range) && (result.consumedProtein <= goals.protein.amount + goals.protein.range)) {
				timesMetProteinGoals += 1;
				metProteinGoals = true;
			}

			if ((result.consumedCarbs >= goals.carbs.amount - goals.carbs.range) && (result.consumedCarbs<= goals.carbs.amount + goals.carbs.range)) {
				timesMetCarbsGoals += 1;
				metCarbsGoals = true;
			}
			if (metCalorieGoals === true && metFatGoals === true && metProteinGoals === true && metCarbsGoals === true) {
				timesMetAllGoals += 1;
			}
			if (metCalorieGoals === true || metFatGoals === true || metProteinGoals === true || metCarbsGoals === true) {
				timesMetAtLeastOneGoal += 1;
			}
			daysGoalsHaveBeenTracked += 1;
		});

		let stats = {
			timesMetCaloriesGoals: timesMetCaloriesGoals,
			timesMetFatGoals: timesMetFatGoals,
			timesMetProteinGoals: timesMetProteinGoals,
			timesMetCarbsGoals: timesMetCarbsGoals,
			timesMetAllGoals: timesMetAllGoals,
			timesMetAtLeastOneGoal: timesMetAtLeastOneGoal,
			daysGoalsHaveBeenTracked: daysGoalsHaveBeenTracked
		}

		console.log(stats);

	});

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



module.exports = {Goal, Entry, Stat};

