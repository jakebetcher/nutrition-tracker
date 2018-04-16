/*'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;



const { Stat } = require('../models');
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

  const exampleUsers = [];
  for (let i=0; i<10; i++) {
  	exampleUsers.push({
  		username: faker.internet.userName(),
  		password: 'examplePass',
  		firstName: faker.name.firstName(),
  		lastName: faker.name.lastName()
  	})
  }

  


function seedStatData() {
  console.info('seeding stats data');
  const seedData = [];
  exampleUsers.forEach(user => {
  	seedData.push({
  		username: user.username,
  		timesMetCaloriesGoals: faker.random.number(100),
      timesMetFatGoals: faker.random.number(100),
      timesMetProteinGoals: faker.random.number(100),
      timesMetCarbsGoals: faker.random.number(100),
      timesMetAllGoals: faker.random.number(30),
      timesMetAtLeastOneGoal: faker.random.number(100),
      daysGoalsHaveBeenTracked: faker.random.number(200)
  	});
  });
  
  //console.log(seedData);

  return Stat.insertMany(seedData);
}

function createUsers() {
	exampleUsers.forEach(user => {
		return User.hashPassword(user.password).then(password =>
      User.create({
        username: user.username,
        password,
        firstName: user.firstName,
        lastName: user.lastName
      })
    );
	});
}
  



describe('stats API resource', function() {
	 
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedStatData();
  });

  beforeEach(function () {
    /*return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName
      })
    );
    createUsers();
  });

  beforeEach(function () {
    return User.hashPassword(explicitPassword).then(password =>
      User.create({
        username: explicitUsername,
        password: explicitPassword,
        firstName: explicitFirstName,
        lastName: explicitLastName
      })
    );
  });

   afterEach(function () {
    return User.remove({});
  });

  afterEach(function () {
    
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });


describe('protected GET Endpoint', function() {
	it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .get('/stats/protected')
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
            username: exampleUsers[0].username,
            firstName: exampleUsers[0].firstName,
            lastName: exampleUsers[0].lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: exampleUsers[0].username
        }
      );

      return chai
        .request(app)
        .get('/stats/protected')
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
    it('Should send protected data', function () {
      let resStats;
      const token = jwt.sign(
        {
          user: {
            username: exampleUsers[1].username,
            firstName: exampleUsers[1].firstName,
            lastName: exampleUsers[1].lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: exampleUsers[1].username,
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .get('/stats/protected')

        .set('authorization', `Bearer ${token}`)
        .then(res => {
        	//console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');

          res.body.forEach(function(stat) {
				expect(stat).to.be.a('object');
				expect(stat).to.include.keys('_id', 'username', 'timesMetCaloriesGoals', 'timesMetFatGoals', 'timesMetProteinGoals', 'timesMetCarbsGoals', 'timesMetAllGoals', 'timesMetAtLeastOneGoal', 'daysGoalsHaveBeenTracked');
			});
			resStats = res.body[0];
			return Stat.findById(resStats._id);
		})
		.then(function(stat) {
			expect(resStats.username).to.equal(stat.username);
			expect(resStats._id).to.equal(`${stat._id}`);
			expect(resStats.timesMetCaloriesGoals).to.equal(stat.timesMetCaloriesGoals);
			expect(resStats.timesMetFatGoals).to.equal(stat.timesMetFatGoals);
			expect(resStats.timesMetProteinGoals).to.equal(stat.timesMetProteinGoals);
			expect(resStats.timesMetCarbsGoals).to.equal(stat.timesMetCarbsGoals);
			expect(resStats.timesMetAllGoals).to.equal(stat.timesMetAllGoals);
			expect(resStats.timesMetAtLeastOneGoal).to.equal(stat.timesMetAtLeastOneGoal);
			expect(resStats.daysGoalsHaveBeenTracked).to.equal(stat.daysGoalsHaveBeenTracked);
		});
          
        });
    });
    
describe('protected POST endpoint', function() {
	it('should reject requests with no credentials', function() {
		const newStat = {
				username: explicitUsername,
				timesMetCaloriesGoals: faker.random.number(100),
        timesMetFatGoals: faker.random.number(100),
        timesMetProteinGoals: faker.random.number(100),
        timesMetCarbsGoals: faker.random.number(100),
        timesMetAllGoals: faker.random.number(30),
        timesMetAtLeastOneGoal: faker.random.number(100),
        daysGoalsHaveBeenTracked: faker.random.number(200)
			};

		return chai.request(app)
		.post('/stats/protected')
		.send(newStat)
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

		const anotherNewStat = {
			username: explicitUsername,
			timesMetCaloriesGoals: faker.random.number(100),
      timesMetFatGoals: faker.random.number(100),
      timesMetProteinGoals: faker.random.number(100),
      timesMetCarbsGoals: faker.random.number(100),
      timesMetAllGoals: faker.random.number(30),
      timesMetAtLeastOneGoal: faker.random.number(100),
      daysGoalsHaveBeenTracked: faker.random.number(200)
		};

		return chai
        .request(app)
        .post('/stats/protected')
        .send(anotherNewStat)
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
	it('should create a new stat', function() {
		const thirdNewStat = {
			username: explicitUsername,
			timesMetCaloriesGoals: faker.random.number(100),
      timesMetFatGoals: faker.random.number(100),
      timesMetProteinGoals: faker.random.number(100),
      timesMetCarbsGoals: faker.random.number(100),
      timesMetAllGoals: faker.random.number(30),
      timesMetAtLeastOneGoal: faker.random.number(100),
      daysGoalsHaveBeenTracked: faker.random.number(200)	
		};


		const token = jwt.sign(
        {
          user: {
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
        .post('/stats/protected')
        .send(thirdNewStat)
        .set('authorization', `Bearer ${token}`)

        .then(function(res) {
			expect(res).to.have.status(201);
      		expect(res).to.be.json;
      		expect(res.body).to.be.a('object');
      		expect(res.body).to.include.keys('_id', 'username', 'timesMetCaloriesGoals', 'timesMetFatGoals', 'timesMetProteinGoals', 'timesMetCarbsGoals', 'timesMetAllGoals', 'timesMetAtLeastOneGoal', 'daysGoalsHaveBeenTracked');
      		return Stat.findById(res.body._id);

		})
		.then(function(stat) {
			expect(stat.username).to.equal(thirdNewStat.username);
			expect(stat.timesMetCaloriesGoals).to.equal(thirdNewStat.timesMetCaloriesGoals);
			expect(stat.timesMetFatGoals).to.equal(thirdNewStat.timesMetFatGoals);
			expect(stat.timesMetProteinGoals).to.equal(thirdNewStat.timesMetProteinGoals);
			expect(stat.timesMetCarbsGoals).to.equal(thirdNewStat.timesMetCarbsGoals);
			expect(stat.timesMetAllGoals).to.equal(thirdNewStat.timesMetAllGoals);
      expect(stat.timesMetAtLeastOneGoal).to.equal(thirdNewStat.timesMetAtLeastOneGoal);
      expect(stat.daysGoalsHaveBeenTracked).to.equal(thirdNewStat.daysGoalsHaveBeenTracked);
		});
	});



	});

	describe('protected PUT Endpoint', function() {
		it('should reject requests with no credentials', function() {
			const updatedStat = {
				timesMetCaloriesGoals: 50,
        timesMetAtLeastOneGoal: 55,
        daysGoalsHaveBeenTracked: 71
			};

			return Stat
			.findOne({username: exampleUsers[0].username})
			.then(stat => {
				return chai.request(app)
				.put('/stats/protected')
        .send(updatedStat)
			})
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
			const updatedStat = {
        timesMetCaloriesGoals: 51,
        timesMetAtLeastOneGoal: 56,
        daysGoalsHaveBeenTracked: 72
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

			return Stat
			.findOne({username: exampleUsers[1].username})
			.then(stat => {
				return chai.request(app)
				.put('/stats/protected')
        .send(updatedStat)
				.set('authorization', `Bearer ${token}`)
			})
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

		it('should update fields you send over', function() {
			const updatedStat = {
        timesMetCaloriesGoals: 52,
        timesMetAtLeastOneGoal: 57,
        daysGoalsHaveBeenTracked: 73
      };

			const token = jwt.sign(
        {
          user: {
            username: exampleUsers[2].username,
            firstName: exampleUsers[2].firstName,
            lastName: exampleUsers[2].lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: exampleUsers[2].username,
          expiresIn: '7d'
        }
      );

			return Stat
			.findOne({username: exampleUsers[2].username})
			.then(stat => {
				return chai.request(app)
				.put('/stats/protected')
				.send(updatedStat)
				.set('authorization', `Bearer ${token}`)
			})
			.then(function(res) {
			expect(res).to.have.status(204);

			return Stat.findOne({username: exampleUsers[2].username});
		})
		.then(function(stat) {
			expect(stat.timesMetCaloriesGoals).to.equal(updatedStat.timesMetCaloriesGoals);
			expect(stat.timesMetAtLeastOneGoal).to.equal(updatedStat.timesMetAtLeastOneGoal);
      expect(stat.daysGoalsHaveBeenTracked).to.equal(updatedStat.daysGoalsHaveBeenTracked);
		});

		});
	});
});*/
  