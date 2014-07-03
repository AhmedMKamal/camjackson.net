postHandler = require('../../src/handlers/postHandler');
models      = require('../../src/models');
var Post = models.Post;

describe('postHandler', function(){
    var result;

    beforeEach(function() {
        result = jasmine.createSpyObj('result', ['json', 'send']);
    });

    describe('getPosts', function() {
        it('gets all stored posts', function() {
            var posts = ['post 1', 'post 2'];
            spyOn(Post, 'find').and.callFake(function (conditions, callback) {
                callback(null, posts);
            });

            postHandler.getPosts(null, result);

            expect(result.json).toHaveBeenCalledWith(posts);
            expect(result.send).not.toHaveBeenCalled();
        });

        it('sends the error back upon failure', function() {
            var error = 'Broken!';
            spyOn(Post, 'find').and.callFake(function(conditions, callback) {
                callback(error, null);
            });

            postHandler.getPosts(null, result);

            expect(result.send).toHaveBeenCalledWith(error);
            expect(result.json).not.toHaveBeenCalled();
        });
    });

    describe('getPost', function() {
        it('gets a post matching the given id', function() {
            var post = 'some Post';
            spyOn(Post, 'findById').and.callFake(function(id, callback) {
                callback(null, post)
            });

            var postId = 7;
            postHandler.getPost({'params': {'post_id': postId}}, result);

            expect(Post.findById).toHaveBeenCalledWith(postId, jasmine.any(Function));
            expect(result.json).toHaveBeenCalledWith(post);
            expect(result.send).not.toHaveBeenCalled();
        });

        it('sends the error back upon failure', function() {
            var error = 'Whoops!';
            spyOn(Post, 'findById').and.callFake(function(id, callback) {
               callback(error, null)
            });

            postHandler.getPost({'params': {'post_id': ':('}}, result);

            expect(result.send).toHaveBeenCalledWith(error);
            expect(result.json).not.toHaveBeenCalled();
        });

        //TODO: When request is invalid (e.g. no post_id)
    });

    describe('createPost', function() {
        it('creates a new post with the given data', function() {
            var createdPost = 'the new post';
            spyOn(Post, 'create').and.callFake(function(document, callback) {
                callback(null, createdPost);
            });

            postHandler.createPost({'body': {'title': 'Hello, world!', 'text': 'Lorem ipsum.'}}, result);

            var document = {'title': 'Hello, world!', 'text': 'Lorem ipsum.', 'authorId': null};
            expect(Post.create).toHaveBeenCalledWith(document, jasmine.any(Function));
            expect(result.json).toHaveBeenCalledWith(createdPost);
            expect(result.send).not.toHaveBeenCalled();
        });

        it('sends the error back upon failure', function() {
            var error = 'No db connection!';
            spyOn(Post, 'create').and.callFake(function(document, callback) {
                callback(error, null);
            });

            postHandler.createPost({'body': {'title': '', 'text': ''}}, result);

            expect(result.send).toHaveBeenCalledWith(error);
            expect(result.json).not.toHaveBeenCalled();
        });

        //TODO: When request is invalid (e.g. no title, no text)
    });

    describe('deletePost', function() {

    });
});
