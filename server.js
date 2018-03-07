'use strict';
require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Goal, Entry, Stat } = require('./models');
const { User } = require('./users')

const app = express();

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

app.use(morgan('common'));
app.use(bodyParser.json());


passport.use(localStrategy);
passport.use(jwtStrategy);


app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

app.use(express.static("public"));

const jwtAuth = passport.authenticate('jwt', { session: false });

app.post('/goals/protected', jwtAuth, (req, res) => {
  //console.log(req.body);
  //console.log(req.body.calories);
  //const enteredNutrients = Object.keys(req.body);
  
console.log(req.user)
  
    let goal = new Goal({
    	username: req.user.username,
    	calories: {
    		amount: req.body.calories.amount,
    		range: req.body.calories.range
    	},
    	fat: {
    		amount: req.body.fat.amount,
    		range: req.body.fat.range
    	},
    	protein: {
    		amount: req.body.protein.amount,
    		range: req.body.protein.range
    	},
    	carbs: {
    		amount: req.body.carbs.amount,
    		range: req.body.carbs.range
    	}
    });

    goal.save()
    /*.then(goal => {
    	
    	
    	goal
    	.populate('user')
    	.exec(function(err, goal) {
    		if (err) return handleError(err);
    console.log('The goal is %s', req.user.goal);
    	});
    	
    	
    })*/



      .then(user => res.status(201).json(user))
      .catch(err => {
      console.error(err);

      res.status(500).json({ error: 'Something went wrong' });
    });
  
  
});

app.get('/goals', (req, res) => {
  Goal
    .find()
    .then(goals => {
      res.json(goals.map(goal => goal));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.put('/goals/:id', (req, res) => {
	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['calories', 'fat', 'protein', 'carbs'];
  updateableFields.forEach(field => {
  	if (field in req.body) {
  		update[field] = req.body[field];
  	}
  });

  Goal
  .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
  .then(updatedGoal => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});

app.delete('/goals/:id', (req, res) => {
  Goal
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;


function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}


function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
