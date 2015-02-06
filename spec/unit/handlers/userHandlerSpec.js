var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var Q = require('q');

var marked = require('marked');

var UserHandler = require('../../../lib/handlers/userHandler').UserHandler;
var helpers = require('../../../lib/helpers');
var User = require('../../../lib/models').User;

describe('UserHandler', function() {
  var sandbox;
  var response;
  var userHandler = new UserHandler(function(){return 'a responder';});

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(helpers, 'getEnvConfig').returns('the config');
    response = {
      render: sandbox.spy(),
      redirect: sandbox.spy()
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('updateUser', function() {
    var requestBody;

    beforeEach(function() {
      requestBody = {
        username: 'new-username',
        password: 'new-password',
        confirmPassword: 'new-password'
      };
    });

    it('flashes an error and redirects to the settings page when the username field is blank', function() {
      sandbox.spy(User, 'update');
      requestBody.username = '';
      var request = { body: requestBody, params: {username: 'some-user'}, flash: sandbox.spy() };

      userHandler.updateUser(request, response);
      expect(User.update).not.to.have.been.called;
      expect(request.flash).to.have.been.calledWithExactly('errorMessage', 'Please enter a username');
      expect(response.redirect).to.have.been.calledWithExactly(303, '/settings');
    });

    it('flashes an error and redirects to the settings page when the password field is blank', function() {
      sandbox.spy(User, 'update');
      requestBody.password = '';
      var request = { body: requestBody, params: {username: 'some-user'}, flash: sandbox.spy() };

      userHandler.updateUser(request, response);
      expect(User.update).not.to.have.been.called;
      expect(request.flash).to.have.been.calledWithExactly('errorMessage', 'Please enter a password');
      expect(response.redirect).to.have.been.calledWithExactly(303, '/settings');
    });

    it('flashes an error and redirects to the settings page when the passwords do not match', function() {
      sandbox.spy(User, 'update');
      requestBody.confirmPassword = 'typo-password';
      var request = { body: requestBody, params: {username: 'some-user'}, flash: sandbox.spy() };

      userHandler.updateUser(request, response);
      expect(User.update).not.to.have.been.called;
      expect(request.flash).to.have.been.calledWithExactly('errorMessage', 'Passwords do not match');
      expect(response.redirect).to.have.been.calledWithExactly(303, '/settings');
    });

    it('updates the user and redirects to the settings page when everything is OK', function() {
      var foundUser = { save: sandbox.spy() };
      var promiseWithUser = Q.fcall(function() {return foundUser});
      sandbox.stub(User, 'findOne').returns({exec: function() {return promiseWithUser;}});
      var request = { body: requestBody, params: {username: 'some-user'}};

      return userHandler.updateUser(request, response).then(function() {
        expect(User.findOne).to.have.been.calledWithExactly({username: 'some-user'});
        expect(foundUser.username).to.equal('new-username');
        expect(foundUser.password).to.equal('new-password');
        expect(foundUser.save).to.have.been.calledOnce;
        expect(response.redirect).to.have.been.calledWithExactly(303, '/settings');
      });
    });

    it('flashes an error and redirects to the settings page when the username is taken', function() {
      var failingPromise = Q.fcall(function() {throw new Error();});
      sandbox.stub(User, 'findOne').returns({ exec: function() {return failingPromise;} });
      var request = { body: requestBody, params: {username: 'some-user'}, flash: sandbox.spy() };

      return userHandler.updateUser(request, response).then(function() {
        expect(request.flash).to.have.been.calledWithExactly('errorMessage', 'Sorry, that username is taken');
        expect(response.redirect).to.have.been.calledWithExactly(303, '/settings');
      });
    });
  });
});
