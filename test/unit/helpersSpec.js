'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;

const helpers = require('../../src/helpers');

describe('helpers', function() {
  let sandbox;
  let result;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    result = {
      status: sandbox.spy(function(_) {return result;}),
      send: sandbox.spy(),
      render: sandbox.spy()
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('trimPost', function() {
    describe('the post has no valid fold', function() {
      it('does not modify the post when there is no fold', function(){
        expect(helpers.trimPost('whatever', 'blah')).to.equal('whatever');
      });

      it('does not modify the post when the fold is not on its own line', function() {
        const postBody ='**before**\r\n\r\n' +
          '`[//]: # (fold)`\r\n\r\n' +
          'after';
        expect(helpers.trimPost(postBody, 'blah')).to.equal(postBody);
      });
    });

    describe('the post has a fold', function() {
      const postBody = '**before**\r\n\r\n' +
        '[//]: # (fold)\r\n\r\n' +
        'after';

      it('leaves the before text unmodified', function() {
        expect(helpers.trimPost(postBody, '/link')).to.include('**before**\r\n\r\n');
      });

      it('replaces the fold indicator with a link to the post', function() {
        const trimmed = helpers.trimPost(postBody, '/link');
        expect(trimmed).to.not.include('fold');
        expect(trimmed).to.include('[Read more...](/link)')
      });

      it('removes the text after the fold', function() {
        expect(helpers.trimPost(postBody, '/link')).to.not.include('after');
      });
    });
  });

  describe('bodyMethodOverrider', function() {
    it('returns nothing when the request has no body', function() {
      const method = helpers.bodyMethodOverrider({});
      expect(method).to.be.undefined;
    });

    it('returns nothing when the request body is not an object', function() {
      const method = helpers.bodyMethodOverrider({ body: 'body' });
      expect(method).to.be.undefined;
    });

    it('returns nothing when the request body object does not contain _method', function() {
      const method = helpers.bodyMethodOverrider({ body: {} });
      expect(method).to.be.undefined;
    });

    it('returns the given method when the request body does contain _method', function() {
      const method = helpers.bodyMethodOverrider({ body: {_method: 'patch'} });
      expect(method).to.equal('patch');
    });
  });

  describe('getEnvConfig', function () {
    before(function() {
      process.env.SITE_TITLE = 'site title';
      process.env.SITE_HEADING = 'site heading';
      process.env.SITE_SUB_HEADING = 'site sub-heading';
      process.env.SITE_DOMAIN = 'mysite.com';
      process.env.GOOGLE_ANALYTICS_ID = 'UA-12345678-9';
    });

    after(function () {
      process.env.SITE_TITLE = '';
      process.env.SITE_HEADING = '';
      process.env.SITE_SUB_HEADING = '';
      process.env.SITE_DOMAIN = '';
      process.env.GOOGLE_ANALYTICS_ID = '';
    });

    it('aggregates all the required environment variables', function () {
      expect(helpers.getEnvConfig()).to.deep.equal({
        title: 'site title',
        heading: 'site heading',
        sub_heading: 'site sub-heading',
        domain: 'mysite.com',
        google_analytics_id: 'UA-12345678-9'
      });
    });
  });

  describe('errorHandler', function() {
    it('renders a last resort error page with a failure status', function() {
      helpers.errorHandler(null, null, result);
      expect(result.status).to.have.been.calledWithExactly(500);
      expect(result.render).to.have.been.calledWithExactly('pages/error.jade');
    })
  });

  describe('createResponder', function() {
    it('sends the supplied html with a success status when there are no errors', function() {
      helpers.createResponder(result)(null, 'some html');
      expect(result.status).to.have.been.calledWithExactly(200);
      expect(result.send).to.have.been.calledWithExactly('some html');
    });

    it('renders the error page with a failure status when there are errors', function() {
      helpers.createResponder(result)('some error', null);
      expect(result.status).to.have.been.calledWithExactly(500);
      expect(result.render).to.have.been.calledWithExactly('pages/error.jade');
    });
  });
});
