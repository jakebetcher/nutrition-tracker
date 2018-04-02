/*'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { closeServer, runServer, app } = require('./server');
const { User } = require('./users');

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

const Goal = mongoose.model('Goal', goalSchema);
const Entry = mongoose.model('Entry', entrySchema);

const statObject = {
	returnGoalStats(id, callback) {
		Goal.find({user: id})
		.sort({date: -1})
		.limit(1)
		.exec(function(err, goal) {
			if (err) {console.log(error)}
			let goalId = goal[0]._id;
	
			Entry.aggregate([
 			{
 				$match: {
 					user: mongoose.Types.ObjectId(id),
 					goal: mongoose.Types.ObjectId(goalId) 			
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
      
      let goals = goal[0];
			let timesMetCaloriesGoals = 0;
			let timesMetFatGoals = 0;
			let timesMetProteinGoals= 0;
			let timesMetCarbsGoals = 0;
			let timesMetAllGoals = 0;
			let timesMetAtLeastOneGoal = 0;
			let daysGoalsHaveBeenTracked = 0;
        
      result.forEach(result => {
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

			callback(stats);
    });
	})
}
}

module.exports = {Goal, Entry, statObject};*/

