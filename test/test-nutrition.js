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
		    amount: faker.random.number(3000),
			range: faker.random.number(400)
		},
		fat: {
			amount: faker.random.number(200),
			range: faker.random.number(30)
		},
		protein: {
			amount: faker.random.number(200),
			range: faker.random.number(40)
		},
		carbs: {
			amount: faker.random.number(200),
			range: faker.random.number(40)
		}
		};
	}

describe('goals API resource', function() {
	 
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
      		res.body.should.include.keys('_id', 'calories', 'fat', 'protein', 'carbs', 'date');
      		return Goal.findById(res.body._id);

		})
		.then(function(goal) {
			goal.calories.amount.should.equal(newGoal.calories.amount);
			goal.calories.range.should.equal(newGoal.calories.range);
			goal.fat.range.should.equal(newGoal.fat.range);
			goal.protein.range.should.equal(newGoal.protein.range);
			goal.carbs.amount.should.equal(newGoal.carbs.amount);
		});
	});
});

describe('GET Endpoint', function() {
	it('should return all existing goals', function() {
		let res;

		return chai.request(app)
		.get('/goals')
		.then(_res => {
			res = _res;
			res.should.have.status(200);
			res.body.should.have.length.of.at.least(1);
			return Goal.count();
		})
		.then(count => {
			res.body.should.have.length(count);
		});
	});

	it('should return goals with the right fields', function() {
		let resGoals;
		return chai.request(app)
		.get('/goals')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.length.of.at.least(1);

			res.body.forEach(function(goal) {
				goal.should.be.a('object');
				goal.should.include.keys('_id', 'calories', 'fat', 'protein', 'carbs', 'date');
			});
			resGoals = res.body[0];
			return Goal.findById(resGoals._id);
		})
		.then(function(goal) {
			resGoals._id.should.equal(goal._id);
			resGoals.calories.amount.should.equal(goal.calories.amount);
			resGoals.calories.range.should.equal(goal.calories.range);
			resGoals.fat.amount.should.equal(goal.fat.amount);
			resGoals.fat.range.should.equal(goal.fat.range);
			resGoals.protein.amount.should.equal(goal.protein.amount);
			resGoals.protein.range.should.equal(goal.protein.range);
			resGoals.carbs.amount.should.equal(goal.carbs.amount);
			resGoals.carbs.range.should.equal(goal.carbs.range);
		});
	});
});


describe('test', function() {

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
});
});