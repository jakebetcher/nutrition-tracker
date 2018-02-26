const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { Goal } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());



app.use(express.static("public"));

app.post('/goals', (req, res) => {
  //console.log(req.body);
  //console.log(req.body.calories);
  //const enteredNutrients = Object.keys(req.body);
  const goalObject = {};

  const nutrients = ['calories', 'fat', 'protein', 'carbs'];
  /*if ('calories' in req.body) {
  	goalObject.calories = {
  		amount: req.body.calories.amount,
  		range: req.body.calories.range
  	};
  } 

  if ('fat' in req.body) {
  	goalObject.fat = {
  		amount: req.body.fat.amount,
  		range: req.body.fat.range
  	};
  } 

  if ('protein' in req.body) {
  	goalObject.protein = {
  		amount: req.body.protein.amount,
  		range: req.body.protein.range
  	};
  } 

  if ('carbs' in req.body) {
  	goalObject.carbs = {
  		amount: req.body.carbs.amount,
  		range: req.body.carbs.range
  	};
  } 

  for (let i=0; i<nutrients.length; i++) {
  	if (nutrients[i] in req.body) {
  	let nutrient = nutrients[i];
  	goalObject.nutrient = {
  		amount: req.body.nutrient.amount,
  		range: req.body.nutrient.range
  	};
  } 
  }*/

    Goal
    .create({
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
    })
      .then(goal => res.status(201).json(goal))
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

app.post('/goals/:id', (req, res) => {
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
