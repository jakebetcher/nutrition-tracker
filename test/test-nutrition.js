'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const should = chai.should();

chai.use(chaiHttp);

const { closeServer, runServer, app } = require('../server');

describe('test', function() {
	 
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });



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