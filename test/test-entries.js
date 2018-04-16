/*'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;



const { Entry } = require('../models');
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

  


function seedEntryData() {
  console.info('seeding entry data');
  const seedData = [];
  exampleUsers.forEach(user => {
  	seedData.push({
  		username: user.username,
  		consumedCalories: faker.random.number(1000),
      consumedFat: faker.random.number(50),
      consumedProtein: faker.random.number(50),
      consumedCarbs: faker.random.number(70)
  	});
  });
  return Entry.insertMany(seedData);
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
  



describe('entries API resource', function() {
	 
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedEntryData();
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
        .get('/entries/protected')
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
        .get('/entries/protected')
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
      let resEntries;
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
        .get('/entries/protected')

        .set('authorization', `Bearer ${token}`)
        .then(res => {
        	//console.log(res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');

          res.body.forEach(function(entry) {
				expect(entry).to.be.a('object');
				expect(entry).to.include.keys('_id', 'username', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs');
			});
			resEntries = res.body[0];
			return Entry.findById(resEntries._id);
		})
		.then(function(entry) {
			expect(resEntries.username).to.equal(entry.username);
			expect(resEntries._id).to.equal(`${entry._id}`);
			expect(resEntries.timesMetCaloriesGoals).to.equal(entry.timesMetCaloriesGoals);
			expect(resEntries.consumedCalories).to.equal(entry.consumedCalories);
			expect(resEntries.consumedFat).to.equal(entry.consumedFat);
			expect(resEntries.consumedProtein).to.equal(entry.consumedProtein);
			expect(resEntries.consumedCarbs).to.equal(entry.consumedCarbs);
		});
          
        });
    });
    
describe('protected POST endpoint', function() {
	it('should reject requests with no credentials', function() {
		const newEntry = {
				username: explicitUsername,
				consumedCalories: faker.random.number(1000),
        consumedFat: faker.random.number(50),
        consumedProtein: faker.random.number(50),
        consumedCarbs: faker.random.number(70)
			};

		return chai.request(app)
		.post('/entries/protected')
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

		const anotherNewEntry = {
			username: explicitUsername,
			consumedCalories: faker.random.number(1000),
      consumedFat: faker.random.number(50),
      consumedProtein: faker.random.number(50),
      consumedCarbs: faker.random.number(70)
		};

		return chai
        .request(app)
        .post('/entries/protected')
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
		const thirdNewEntry = {
			username: explicitUsername,
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
        .post('/entries/protected')
        .send(thirdNewEntry)
        .set('authorization', `Bearer ${token}`)

        .then(function(res) {
			expect(res).to.have.status(201);
      		expect(res).to.be.json;
      		expect(res.body).to.be.a('object');
      		expect(res.body).to.include.keys('_id', 'username', 'consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs');
      		return Entry.findById(res.body._id);

		})
		.then(function(entry) {
			expect(entry.username).to.equal(thirdNewEntry.username);
			expect(entry.consumedCalories).to.equal(thirdNewEntry.consumedCalories);
			expect(entry.consumedFat).to.equal(thirdNewEntry.consumedFat);
			expect(entry.consumedProtein).to.equal(thirdNewEntry.consumedProtein);
			expect(entry.consumedCarbs).to.equal(thirdNewEntry.consumedCarbs);
		});
	});



	});

	describe('protected PUT Endpoint', function() {
		it('should reject requests with no credentials', function() {
			const updatedEntry = {
				consumedCalories: 1500,
        consumedFat: 75,
        consumedProtein: 70,
        consumedCarbs: 80
			};

			return Entry
			.findOne({username: exampleUsers[0].username})
			.then(entry => {
				return chai.request(app)
				.put('/entries/protected')
        .send(updatedEntry)
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
			const updatedEntry = {
        consumedCalories: 1500,
        consumedFat: 75,
        consumedProtein: 70,
        consumedCarbs: 80
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

			return Entry
			.findOne({username: exampleUsers[1].username})
			.then(entry => {
				return chai.request(app)
				.put('/entries/protected')
        .send(updatedEntry)
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
			const updatedEntry = {
        consumedCalories: 1500,
        consumedFat: 75,
        consumedProtein: 70,
        consumedCarbs: 80
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

			return Entry
			.findOne({username: exampleUsers[2].username})
			.then(entry => {
				return chai.request(app)
				.put('/entries/protected')
				.send(updatedEntry)
				.set('authorization', `Bearer ${token}`)
			})
			.then(function(res) {
			expect(res).to.have.status(204);

			return Entry.findOne({username: exampleUsers[2].username});
		})
		.then(function(entry) {
			expect(entry.consumedCalories).to.equal(updatedEntry.consumedCalories);
			expect(entry.consumedFat).to.equal(updatedEntry.consumedFat);
      expect(entry.consumedProtein).to.equal(updatedEntry.consumedProtein);
      expect(entry.consumedCarbs).to.equal(updatedEntry.consumedCarbs);
		});

		});
	});

  describe('protected DELETE Endpoint', function() {
    it('should reject requests with no credentials', function() {
      return Entry
      .findOne({username: exampleUsers[3].username})
      .then(entry => {
        return chai.request(app)
        .delete('/entries/protected')
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

    it('should reject requests with an invalid token', function() {
      const token = jwt.sign(
        {
          user: {
            username: exampleUsers[3].username,
            firstName: exampleUsers[3].firstName,
            lastName: exampleUsers[3].lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: exampleUsers[3].username
        }
      );


      return Entry
      .findOne({username: exampleUsers[3].username})
      .then(entry => {
        return chai.request(app)
        .delete('/entries/protected')
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

    it('should delete an entry', function() {
      const token = jwt.sign(
        {
          user: {
            username: exampleUsers[3].username,
            firstName: exampleUsers[3].firstName,
            lastName: exampleUsers[3].lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: exampleUsers[3].username,
          expiresIn: '7d'
        }
      );

      return Entry
      .findOne({username: exampleUsers[3].username})
      .then(entry => {
        return chai.request(app)
        .delete('/entries/protected')
        .set('authorization', `Bearer ${token}`)
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return Entry.findOne({username: exampleUsers[3].username})
      })
      .then(entry => {
        expect(entry).to.not.exist;
      })
    });
  });
});*/
  