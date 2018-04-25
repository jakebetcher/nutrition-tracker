'use strict';

require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { Goal } = require('../goals');
const { Entry } = require('../entries');
const { User } = require('../users');
const { closeServer, runServer, app } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

const explicitUsername = 'exampleUsername1234';
const explicitPassword = 'examplePass';
const explicitFirstName = 'Example';
const explicitLastName = 'User';

describe('entries API Resource', function() {

	before(function () {
    return runServer(TEST_DATABASE_URL);
  });

   afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe('protected POST Endpoint', function() {
  	it('Should reject requests with no credentials', function () {
      const newEntry = {
				foodName: 'example food',
				consumedCalories: faker.random.number(1000),
	      consumedFat: faker.random.number(50),
	      consumedProtein: faker.random.number(50),
	      consumedCarbs: faker.random.number(70)
			};

      return chai
        .request(app)
        .post('/entries/')
        .send(newEntry)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('should reject requests with an expired token', function() {
    	const anotherNewEntry = {
    		foodName: 'example food',
				consumedCalories: faker.random.number(1000),
	      consumedFat: faker.random.number(50),
	      consumedProtein: faker.random.number(50),
	      consumedCarbs: faker.random.number(70)
    	};

    	const token = jwt.sign(
	      {
	        user: {
	          username: explicitUsername,
	          firstName: explicitFirstName,
	          lastName: explicitLastName
	        },
	        exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
	      },
	      JWT_SECRET,
	      {
	        algorithm: 'HS256',
	        subject: explicitUsername
	      }
	    );

	    return chai
	      .request(app)
	      .post('/entries/')
	      .send(anotherNewEntry)
	      .set('authorization', `Bearer ${token}`)
	      .then(() =>
	        expect.fail(null, null, 'Request should not succeed')
	      )
	      .catch(err => {
	        if (err instanceof chai.AssertionError) {
	          throw err;
	        }

	        const res = err.response;
	        expect(res).to.have.status(401);
	      });
    });

    it('should create a new entry', function() {
    	let thirdNewEntry;
      return User.hashPassword(explicitPassword)
      .then(password => {
        return User.create({
          username: explicitUsername,
          password: password,
          firstName: explicitFirstName,
          lastName: explicitLastName
        });
      })
      .then(user => {
				return Goal.create({
          user: user._id,
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
        });  
      })
      .then(goal => {
      	let theDate = new Date();
				let theDay = theDate.toDateString();
      	thirdNewEntry = {
					user: goal.user,
					goal: goal._id,
					foodName: 'example food',
					date: theDate,
					day: theDay,
					consumedCalories: faker.random.number(1000),
		      consumedFat: faker.random.number(50),
		      consumedProtein: faker.random.number(50),
		      consumedCarbs: faker.random.number(70)	
				};

        const token = jwt.sign(
          {
            user: {
              _id: goal.user,
              username: explicitUsername,
              firstName: explicitFirstName,
              lastName: explicitLastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: explicitUsername,
            expiresIn: '7d'
          }
        );

        return chai
          .request(app)
          .post('/entries/')
          .send(thirdNewEntry)
          .set('authorization', `Bearer ${token}`)
      })
      .then(function(res) {
      	expect(res).to.have.status(201);
      	expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('_id', 'user', 'foodName', 'goal', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs', 'day', 'date');
        return Entry.findById(res.body._id);
      })
      .then(function(entry) {
      	expect(`${entry.user}`).to.equal(`${thirdNewEntry.user}`);
      	expect(`${entry.goal}`).to.equal(`${thirdNewEntry.goal}`);
				expect(entry.consumedCalories).to.equal(thirdNewEntry.consumedCalories);
				expect(entry.consumedFat).to.equal(thirdNewEntry.consumedFat);
				expect(entry.consumedProtein).to.equal(thirdNewEntry.consumedProtein);
				expect(entry.consumedCarbs).to.equal(thirdNewEntry.consumedCarbs);
      });
    });
  });

	describe('protected GET endpoint (list)', function() {
		it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/entries/list')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username: explicitUsername,
            firstName: explicitFirstName,
            lastName: explicitLastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: explicitUsername
        }
      );

      return chai
        .request(app)
        .get('/entries/list')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('should send protected data', function() {
    	let resEntries;
    	return User.hashPassword(explicitPassword)
      .then(password => {
        return User.create({
          username: explicitUsername,
          password: password,
          firstName: explicitFirstName,
          lastName: explicitLastName
        });
      })
      .then(user => {
				return Goal.create({
          user: user._id,
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
        });  
      })
      .then(goal => {
      	let theDate = new Date();
				let theDay = theDate.toDateString();
      	return Entry.create({
      		user: goal.user,
					goal: goal._id,
					foodName: 'example food',
					date: theDate,
					day: theDay,
					consumedCalories: faker.random.number(1000),
		      consumedFat: faker.random.number(50),
		      consumedProtein: faker.random.number(50),
		      consumedCarbs: faker.random.number(70)
      	});
      })
      .then(entry => {
      	const token = jwt.sign(
          {
            user: { 
              _id: entry.user,
              username: explicitUsername,
              firstName: explicitFirstName,
              lastName: explicitLastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: explicitUsername,
            expiresIn: '7d'
          }
        );

        return chai
          .request(app)
          .get('/entries/list')
          .set('authorization', `Bearer ${token}`)
      })
      .then(res => {
      	expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');

        res.body.forEach(function(entry) {
          expect(entry).to.be.a('object');
          expect(entry).to.include.keys('_id', 'user', 'goal', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs', 'date', 'day');
        });

        resEntries = res.body[0];
        return Entry.findById(resEntries._id);
      })
      .then(entry => {
      	expect(`${entry.user}`).to.equal(`${resEntries.user}`);
      	expect(`${entry.goal}`).to.equal(`${resEntries.goal}`);
				expect(entry.consumedCalories).to.equal(resEntries.consumedCalories);
				expect(entry.consumedFat).to.equal(resEntries.consumedFat);
				expect(entry.consumedProtein).to.equal(resEntries.consumedProtein);
				expect(entry.consumedCarbs).to.equal(resEntries.consumedCarbs);
      });
    });
	});

	describe('protected Get Endpoint (total)', function() {

    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/entries/total')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });  

    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username: explicitUsername,
            firstName: explicitFirstName,
            lastName: explicitLastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: explicitUsername
        }
      );

      return chai
        .request(app)
        .get('/entries/total')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('should send protected Data', function() {
    	let theDate = new Date();
			let theDay = theDate.toDateString();
			let entry1 = {
				foodName: 'example food',
				date: theDate,
				day: theDay,
				consumedCalories: 300,
	      consumedFat: 20,
	      consumedProtein: 15,
	      consumedCarbs: 18
			};

			let entry2 = {
				foodName: 'example food',
				date: theDate,
				day: theDay,
				consumedCalories: 250,
	      consumedFat: 18,
	      consumedProtein: 13,
	      consumedCarbs: 16
			};

			return User.hashPassword(explicitPassword)
      .then(password => {
        return User.create({
          username: explicitUsername,
          password: password,
          firstName: explicitFirstName,
          lastName: explicitLastName
        });
      })
      .then(user => {
				return Goal.create({
          user: user._id,
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
        });  
      })
      .then(goal => {
      	entry1.user = goal.user;
      	entry1.goal = goal._id
      	entry2.user = goal.user;
      	entry2.goal = goal._id;

      	return Entry.create(entry1);
      })
      .then(entry => {
      	return Entry.create(entry2);
      })
      .then(entry => {
      	const token = jwt.sign(
          {
            user: { 
              _id: entry.user,
              username: explicitUsername,
              firstName: explicitFirstName,
              lastName: explicitLastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: explicitUsername,
            expiresIn: '7d'
          }
        );

        return chai
          .request(app)
          .get('/entries/total')
          .set('authorization', `Bearer ${token}`)
      })
      .then(res => {
      	expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');

        res.body.forEach(function(entry) {
          expect(entry).to.be.a('object');
          expect(entry).to.include.keys('_id', 'consumedCalories', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs');
          expect(entry.consumedCalories).to.equal(entry1.consumedCalories + entry2.consumedCalories);
          expect(entry.consumedFat).to.equal(entry1.consumedFat + entry2.consumedFat);
          expect(entry.consumedProtein).to.equal(entry1.consumedProtein + entry2.consumedProtein);
          expect(entry.consumedProtein).to.equal(entry1.consumedProtein + entry2.consumedProtein);
        });
      });
    });
	});

	describe('protected DELETE Endpoint', function() {
		let entryId;
		let userId;

		beforeEach(function() {
    	return User.hashPassword(explicitPassword)
      .then(password => {
        return User.create({
          username: explicitUsername,
          password: password,
          firstName: explicitFirstName,
          lastName: explicitLastName
        });
      })
      .then(user => {
      	userId = user._id;
				return Goal.create({
          user: user._id,
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
        });  
      })
      .then(goal => {
      	let theDate = new Date();
				let theDay = theDate.toDateString();
      	return Entry.create({
      		user: goal.user,
					goal: goal._id,
					foodName: 'example food',
					date: theDate,
					day: theDay,
					consumedCalories: faker.random.number(1000),
		      consumedFat: faker.random.number(50),
		      consumedProtein: faker.random.number(50),
		      consumedCarbs: faker.random.number(70)
      	});
      })
      .then(entry => {
      	entryId = entry._id;
      });
    });


		it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .delete(`/entries/${entryId}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(401);
        });
    });  

    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            username: explicitUsername,
            firstName: explicitFirstName,
            lastName: explicitLastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: explicitUsername
        }
      );

      return chai
        .request(app)
        .delete(`/entries/${entryId}`)
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('should delete an entry', function() {
    	const token = jwt.sign(
          {
            user: { 
              _id: userId,
              username: explicitUsername,
              firstName: explicitFirstName,
              lastName: explicitLastName
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: explicitUsername,
            expiresIn: '7d'
          }
        );

    	let entry;

      return Entry
        .findOne()
        .then(function(_entry) {
          entry = _entry;
          return chai.request(app)
          .delete(`/entries/${entry.id}`)
          .set('authorization', `Bearer ${token}`)
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Entry.findById(entry.id);
        })
        .then(function(_entry) {
          expect(_entry).to.not.exist;
        });
    });
	}); 
});













