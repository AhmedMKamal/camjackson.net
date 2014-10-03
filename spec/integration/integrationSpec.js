var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;

var mongoose = require('mongoose');

var models = require('../../lib/models');
var Config = models.Config;
var Post = models.Post;
var WriteItDown = require('../../lib/writeitdown').WriteItDown;

describe('Integration Test', function() {
  beforeEach(function () {
    mongoose.connect('mongodb://localhost/writeitdown-test');
    return Config.remove({}).exec().then(function() {
      return Config.create({
        title: 'site title',
        heading: 'site heading'
      });
    }).then(function() {
      return Post.remove({}).exec();
    }).then(function() {
      return Post.create({
        title: 'Post title',
        slug: 'post-slug',
        text: '*emphasised*'
      });
    })
  });

  afterEach(function (done) {
    mongoose.connection.close(done)
  });

  describe('GET /', function () {
    it('renders the home page successfully', function(done) {
      request(new WriteItDown().app)
        .get('/')
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.include('<title>site title</title>');
          expect(res.text).to.include('<em>emphasised</em>');
          done();
        });
    });
  });

  describe('GET /write', function () {
    it('renders the post creation page successfully', function(done) {
      request(new WriteItDown().app)
        .get('/write')
        .end(function(err, res) {
          expect(err).to.be.null;
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.include('<title>site title<\/title>');
          expect(res.text).to.include('<input type="submit"');
          done();
        });
    })
  });

  describe('PUT /posts/', function() {
    describe('when there is no post with the given slug', function() {
      it('creates a new post and redirects to it', function(done) {
        request(new WriteItDown().app)
          .post('/posts/')
          .type('form')
          .send({
            _method: 'PUT',
            title: 'New Post',
            slug: 'new-post',
            text: 'This is my newest post.'
          })
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(303);
            expect(res.headers.location).to.equal('/posts/new-post');

            Post.find({}).exec().then(function(posts) {
              expect(posts).to.have.length(2);
              return Post.findOne({slug: 'new-post'}).exec()
            }).then(function(post) {
              expect(post.title).to.equal('New Post');
              expect(post.slug).to.equal('new-post');
              expect(post.text).to.equal('This is my newest post.');
              done();
            });
          });
      });
    });

    describe('when there is an existing post with the given slug', function() {
      it('overwrites the existing post', function(done) {
        request(new WriteItDown().app)
          .post('/posts/')
          .type('form')
          .send({
            _method: 'PUT',
            title: 'Post title (updated)',
            slug: 'post-slug',
            text: '*still emphasised*'
          })
          .end(function (err, res) {
            expect(err).to.be.null;
            expect(res.statusCode).to.equal(303);
            expect(res.headers.location).to.equal('/posts/post-slug');

            Post.find({}).exec().then(function(posts) {
              expect(posts).to.have.length(1);
              return Post.find({slug: 'post-slug'}).exec()
            }).then(function(posts) {
              expect(posts).to.have.length(1);
              expect(posts[0].title).to.equal('Post title (updated)');
              expect(posts[0].slug).to.equal('post-slug');
              expect(posts[0].text).to.equal('*still emphasised*');
              done();
            });
          });

      })
    });
  });

  describe('errors', function () {
    it('gives a 404 for a bad path', function (done) {
      request(new WriteItDown().app)
        .get('/does_not_exist')
        .end(function(err, res) {
          expect(res.statusCode).to.equal(404);
          done();
        });
    });
  });
});
