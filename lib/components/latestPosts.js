'use strict';

const React = require('react');
const PostPreview = require('./postPreview');

module.exports = (props) => (
  <div className="container">
    <div className="row"><h1>Latest posts</h1></div>
    <div className="row">
      { props.posts.map((post) => (<PostPreview key={post.slug} post={post}/>)) }
    </div>
  </div>
);
