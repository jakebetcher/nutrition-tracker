'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Goal} = require('../goals');
const {Entry} = require('../entries');

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
		});
	}
}

module.exports = {statObject};
