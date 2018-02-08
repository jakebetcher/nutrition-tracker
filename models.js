'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const goalsSchema = mongoose.Schema({
	calories: {
		amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false}
	},
	fat: {
		amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false}
	},
	protein: {
		amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false}
	},
	carbs: {
		amount: {type: Number, default: 0},
		isTracked: {type: Boolean, default: false}
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

