'use strict';

const React = require('react');
const moment = require('moment');
const marked = require('marked');
const highlightjs = require('highlight.js');

marked.setOptions({
  highlight: function(code) {
    return highlightjs.highlightAuto(code).value;
  }
});

const Page = require('./page');

module.exports = (props) => (
  <Page>
    <div className="container latest-posts">
      <div className="row"><h1>Archive</h1></div>
      {
        props.posts.map(post => (
          <div key={post.slug} className="container post">
            <h1><a href={`/new/post/${post.slug}`}>{post.title}</a></h1>
            <time pubdate className="pull-right"><em>{moment(post.posted).format('Do MMMM YYYY')}</em></time>
            <hr/>
            <div dangerouslySetInnerHTML={{__html: marked(post.blurb)}}></div>
            <a className="pull-right" href={`/new/post/${post.slug}`}>Read more...</a>
          </div>
        ))
      }
    </div>
  </Page>
);
