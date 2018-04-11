'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;



const { Goal } = require('../goals');
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

  const theUserId = (function() {
  	let theId;

  	function getUserId() {
  		return Object.assign({}, theId);
  	}

  	function setId(id) {
  		theId = id;
  	}

  	return Object.freeze({
		getUserId: getUserId,
		setId: setId
	});
  })();

  const exampleUsers = [];
  for (let i=0; i<10; i++) {
  	exampleUsers.push({
  		username: faker.internet.userName(),
  		password: 'examplePass',
  		firstName: faker.name.firstName(),
  		lastName: faker.name.lastName()
  	})
  }

 function createGoals(user) {
 	for (let i=0; i<10; i++) {
 		Goal.create({
 			user: user,
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
 	}
 }


function seedGoalData() {
  console.info('seeding goal data');
  const seedData = [];
  exampleUsers.forEach(user => {
  	seedData.push({
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
  });


  return Goal.insertMany(seedData);
}

function createUsers() {
	exampleUsers.forEach(user => {
		return User.hashPassword(user.password).then(password => {
      User.create({
        username: user.username,
        password,
        firstName: user.firstName,
        lastName: user.lastName
      }).then(user => {
      	theUserId.setId(user._id);
      	createGoals(user._id);
      });
    });
    });	
}

function addGoalsToUser() {
	createUsers()
}

describe('goals API resource', function() {
	 
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  /*beforeEach(function () {
    return seedGoalData();
  });*/

  beforeEach(function () {
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
      .then(user => {
      	console.log(user);
      	Goal.create({
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
      	})
      	.then(goal => {
      		console.log(goal);
      	})
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
        .get('/goals')
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
        .get('/goals')
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
      let resGoals;
      const token = jwt.sign(
        {
          user: {
          	id: theUserId.getUserId(),
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

      console.log(token);
      return chai
        .request(app)
        .get('/goals')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');

          res.body.forEach(function(goal) {
				expect(goal).to.be.a('object');
				expect(goal).to.include.keys('_id', 'user', 'calories', 'fat', 'protein', 'carbs', 'date');
			});
          console.log(res.body.length);
			resGoals = res.body[0];
			return Goal.findById(resGoals._id);
		})
		.then(function(goal) {
			expect(resGoals.user).to.equal(goal.user);
			expect(resGoals._id).to.equal(`${goal._id}`);
			expect(resGoals.calories.amount).to.equal(goal.calories.amount);
			expect(resGoals.calories.range).to.equal(goal.calories.range);
			expect(resGoals.fat.amount).to.equal(goal.fat.amount);
			expect(resGoals.fat.range).to.equal(goal.fat.range);
			expect(resGoals.protein.amount).to.equal(goal.protein.amount);
			expect(resGoals.protein.range).to.equal(goal.protein.range);
			expect(resGoals.carbs.amount).to.equal(goal.carbs.amount);
			expect(resGoals.carbs.range).to.equal(goal.carbs.range);
		});
          
        });
    });
    
/*describe('protected POST endpoint', function() {
	it('should reject requests with no credentials', function() {
		const newGoal = {
				username: explicitUsername,
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

		return chai.request(app)
		.post('/goals/protected')
		.send(newGoal)
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

		const anotherNewGoal = {
			username: explicitUsername,
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

		return chai
        .request(app)
        .post('/goals/protected')
        .send(anotherNewGoal)
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
	it('should create a new goal', function() {
		const thirdNewGoal = {
			username: explicitUsername,
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
        .post('/goals/protected')
        .send(thirdNewGoal)
        .set('authorization', `Bearer ${token}`)

        .then(function(res) {
			expect(res).to.have.status(201);
      		expect(res).to.be.json;
      		expect(res.body).to.be.a('object');
      		expect(res.body).to.include.keys('_id', 'username', 'calories', 'fat', 'protein', 'carbs', 'date');
      		return Goal.findById(res.body._id);

		})
		.then(function(goal) {
			expect(goal.username).to.equal(thirdNewGoal.username);
			expect(goal.calories.amount).to.equal(thirdNewGoal.calories.amount);
			expect(goal.calories.range).to.equal(thirdNewGoal.calories.range);
			expect(goal.fat.range).to.equal(thirdNewGoal.fat.range);
			expect(goal.protein.range).to.equal(thirdNewGoal.protein.range);
			expect(goal.carbs.amount).to.equal(thirdNewGoal.carbs.amount);
		});
	});



	});*/

	/*describe('protected PUT Endpoint', function() {
		it('should reject requests with no credentials', function() {
			const updatedGoal = {
				calories: {
					amount: 2600,
					range: 300
				}
			};

			return Goal
			.findOne({username: exampleUsers[0].username})
			.then(goal => {
				return chai.request(app)
				.put('/goals/protected')
				.send(updatedGoal)
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
			const updatedGoal = {
				calories: {
					amount: 2800,
					range: 275
				}
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

			return Goal
			.findOne({username: exampleUsers[1].username})
			.then(goal => {
				return chai.request(app)
				.put('/goals/protected')
				.send(updatedGoal)
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
			const updatedGoal = {
				calories: {
					amount: 2400,
					range: 201
				}
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

			return Goal
			.findOne({username: exampleUsers[2].username})
			.then(goal => {
				updatedGoal.id = goal.id;
				return chai.request(app)
				.put('/goals/protected')
				.send(updatedGoal)
				.set('authorization', `Bearer ${token}`)
			})
			.then(function(res) {
			expect(res).to.have.status(204);

			return Goal.findOne({username: exampleUsers[2].username});
		})
		.then(function(goal) {
			expect(goal.calories.amount).to.equal(updatedGoal.calories.amount);
			expect(goal.calories.range).to.equal(updatedGoal.calories.range);
		});

		});
	});
});*/
    

/*describe('POST Endpoint', function() {
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
});*/

/*describe('GET Endpoint', function() {
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
			resGoals._id.should.equal(`${goal._id}`);
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

/*describe('PUT Endpoint', function() {
	it('should update fields you send over', function() {
		const updateData = {
			calories: {
				amount: 3000,
				range: 300
			}
		};
		return Goal
		.findOne()
		then(function(goal) {
			updateData.id = goal.id;

			return chai.request(app)
			.put(`/goals/${goal.id}`)
		})
		.then(function(res) {
			res.should.have.status(204);

			return Goal.findById(updateData.id);
		})
		.then(function(goal) {
			goal.calories.amount.should.equal(updateData.calories.amount);
			goal.calories.range.should.equal(updateData.calories.range);
		});
	});
});

describe('DELETE Endpoint', function() {
	it('delete a goal by id', function() {

      let goal;

      return Goal
        .findOne()
        .then(function(_goal) {
          goal = _goal;
          return chai.request(app).delete(`/goals/${goal.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Goal.findById(goal.id);
        })
        .then(function(_goal) {
          should.not.exist(_goal);
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
});*/
});
