'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();



const { Goal } = require('../models');
const { closeServer, runServer, app } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedGoalData() {
  console.info('seeding goal data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push(generateGoalData());
  }
  // this will return a promise
  return Goal.insertMany(seedData);
}

function generateGoalData() {
	return {
		calories: {
			goalAmount: faker.random.number(3000),
			range: faker.random.number(400),
			consumedAmount: faker.random.number(3200),
			metGoal: faker.random.boolean(),
			timesGoalsWereMet: faker.random.number(100)
		},
		fat: {
			goalAmount: faker.random.number(200),
			range: faker.random.number(30),
			consumedAmount: faker.random.number(220),
			metGoal: faker.random.boolean(),
			timesGoalsWereMet: faker.random.number(100)
		},
		protein: {
			goalAmount: faker.random.number(200),
			range: faker.random.number(40),
			consumedAmount: faker.random.number(250),
			metGoal: faker.random.boolean(),
			timesGoalsWereMet: faker.random.number(100)
		},
		carbs: {
			goalAmount: faker.random.number(200),
			range: faker.random.number(40),
			consumedAmount: faker.random.number(230),
			metGoal: faker.random.boolean(),
			timesGoalsWereMet: faker.random.number(100)
		},
		allNutrients: {
			metAllGoals: faker.random.boolean(),
			metAtLeastOneGoal: faker.random.boolean(),
			timesAllGoalsWereMet: faker.random.number(100),
			timesAtLeastOneGoalWasMet: faker.random.number(100),
			daysGoalsHaveBeenTracked: faker.random.number(150)
		}
		};
	}

/*describe('goals API resource', function() {
	 
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedGoalData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

describe('POST Endpoint', function() {
	it('should add a new set of goals', function() {
		const newGoal = generateGoalData();
		return chai.request(app)
		.post('/goals')
		.send(newGoal)
		.then(function(res) {
			res.should.have.status(201);
      		res.should.be.json;
      		res.body.should.be.a('object');
      		res.body.should.include.keys('id', 'calories', 'fat', 'protein', 'carbs', 'allNutrients');
      		return Goal.findById(res.body.id);

		})
		.then(function(goal) {
			goal.calories.goalAmount.should.equal(newGoal.calories.goalAmount);
			goal.calories.metGoal.should.equal(newGoal.calories.metGoal);
		});
	});
});*/


/*describe('test', function() {

	it('should display Hello World', function() {
		let res;
      return chai.request(app)
        .get('/')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.should.be.html;
	});
});
});*/
});