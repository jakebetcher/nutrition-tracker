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

const { router: goalsRouter } = require('./goals-router');
const { router: entriesRouter } = require('./entries-router');
const { router: statsRouter } = require('./stats-router');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

app.use(morgan('common'));
app.use(bodyParser.json());


passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/goals', goalsRouter);
app.use('/entries/', entriesRouter);
app.use('/stats', statsRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

app.use(express.static("public"));

const jwtAuth = passport.authenticate('jwt', { session: false });


/**********************************
	entries routes
***********************************/

app.post('/entries/protected', jwtAuth, (req, res) => {
	const requiredFields = ['consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs', 'date', 'day'];
	for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  console.log(req.user._id);

  Goal
  .find({user: req.user._id})
  .sort({"date": -1})
  .limit(1)
  .then(theGoal => {
  	
  	let entry = new Entry({
  	goal: theGoal[0]._id,
  	user: req.user._id,
  	consumedCalories: req.body.consumedCalories,
  	consumedFat: req.body.consumedFat,
  	consumedProtein: req.body.consumedProtein,
  	consumedCarbs: req.body.consumedCarbs,
  	date: req.body.date,
  	day: req.body.day

  });

  entry.save();
  return entry;
})
  .then(entry => res.status(201).json(entry))
  .catch(err => {
  	console.log(err);

  	res.status(500).json({error: 'Something went horribly wrong'});
  })
});

app.get('/entries/test', jwtAuth, (req, res) => {
	let today = new Date();
	let day = today.toDateSting();
	
	Entry
	.find({username: req.user.username})
	.where('day').equals(day)
	.then(entries => {
		const totals = {
			calorieTotal: 0,
			fatTotal: 0,
			proteinTotal: 0,
			carbTotal: 0
		};
		//console.log(Date());

		//res.json(entries.map(entry => entry));

		entries.map(entry => {
			console.log(entry);
			totals.calorieTotal += entry.consumedCalories;
			totals.fatTotal += entry.consumedFat;
			totals.proteinTotal += entry.consumedProtein;
			totals.carbTotal += entry.consumedCarbs;
		});
		res.json(totals);
		console.log(totals);
		//res.json(totals);*/
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Something went horribly wrong'})
	})
})

app.get('/entries/protected', jwtAuth, (req, res) => {
	Entry
	.find({user: req.user._id})
	.then(entry => {
		res.json(entry);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Something went horribly wrong'})
	})
});

app.put('/entries/protected', jwtAuth, (req, res) => {
	const updated = {};
  	const updateableFields = ['consumedCalories', 'consumedFat', 'consumedProtein', 'consumedCarbs'];
  	updateableFields.forEach(field => {
  	if (field in req.body) {
  		updated[field] = req.body[field];
  	}
  });

  	Entry
  .findOneAndUpdate({username: req.user.username}, { $set: updated }, { new: true })
  .then(updatedEntry => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Something went wrong' }));

});

app.delete('/entries/protected', jwtAuth, (req, res) => {
  Entry
    .findOneAndRemove({username: req.user.username})
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



/**********************************
	stats routes
***********************************/

app.post('/stats/protected', jwtAuth, (req, res) => {
	const requiredFields = ['timesMetCaloriesGoals', 'timesMetFatGoals', 'timesMetProteinGoals', 'timesMetCarbsGoals', 'timesMetAllGoals', 'timesMetAtLeastOneGoal', 'daysGoalsHaveBeenTracked'];
	for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  let stat = new Stat({
  	username: req.user.username,
  	timesMetCaloriesGoals: req.body.timesMetCaloriesGoals,
  	timesMetFatGoals: req.body.timesMetFatGoals,
  	timesMetProteinGoals: req.body.timesMetProteinGoals,
  	timesMetCarbsGoals: req.body.timesMetCarbsGoals,
  	timesMetAllGoals: req.body.timesMetAllGoals,
  	timesMetAtLeastOneGoal: req.body.timesMetAtLeastOneGoal,
  	daysGoalsHaveBeenTracked: req.body.daysGoalsHaveBeenTracked
  });

  stat.save()
  .then(stat => res.status(201).json(stat))
  .catch(err => {
  	console.log(err);

  	res.status(500).json({error: 'Something went horribly wrong'});
  })
});

app.get('/stats/protected', jwtAuth, (req, res) => {
	Stat
	.find({username: req.user.username})
	.then(stat => {
		res.json(stat);
	})
	.catch(err => {
		console.log(err);
		res.status(500).json({error: 'Something went horribly wrong'})
	})
});

app.put('/stats/protected', jwtAuth, (req, res) => {
	const updated = {};
  	const updateableFields = ['timesMetCaloriesGoals', 'timesMetFatGoals', 'timesMetProteinGoals', 'timesMetCarbsGoals', 'timesMetAllGoals', 'timesMetAtLeastOneGoal', 'daysGoalsHaveBeenTracked'];
  	updateableFields.forEach(field => {
  	if (field in req.body) {
  		updated[field] = req.body[field];
  	}
  });

  	Stat
  .findOneAndUpdate({username: req.user.username}, { $set: updated }, { new: true })
  .then(updatedEntry => res.status(204).end())
  .catch(err => res.status(500).json({ message: 'Something went wrong' }));

});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

let server;

const config = require('./config');
console.log(config.JWT_EXPIRY);


function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
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
