'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSession = require('express-session');
const DynamoDBStore = require('connect-dynamodb')({session: expressSession});
const passport = require('passport');
const helmet = require('helmet');

const log = require('./logging');
const db = require('./db');
const views = require('./views');
const auth = require('./auth');
const createOrUpdatePost = require('./createOrUpdatePost');
const atomFeed = require('./atomFeed');

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'default secret',
  store: new DynamoDBStore({client: db.client, reapInterval: 604800000}),
  resave: true,
  saveUninitialized: true
};

//Wraps an AWS lambda function for use with express.js
const wrap = lambda => (
  (req, res) => {
    const event = {
      slug: req.params.slug || req.query.post,
      isAuthenticated: req.isAuthenticated()
    };
    const context = {
      succeed: html => res.send(html),
      fail: (status, text) => res.status(status).send(text)
    };
    lambda(event, context);
  }
);

const bodyMethodOverrider = (req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method
  }
};

const errorHandler = (err, req, res, next) => {
  log.error(err);
  res.status(500).send('Something went wrong :(');
};

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride(bodyMethodOverrider));
app.use(express.static('public'));
app.use(expressSession(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(errorHandler);

app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.hsts({ maxAge: 10886400000, includeSubDomains: true,  preload: true, force: true })); //18 weeks
app.use(helmet.csp({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", 'https://oss.maxcdn.com', 'https://www.google-analytics.com'],
  styleSrc: ["'self'", 'https://maxcdn.bootstrapcdn.com', 'https://cdn.jsdelivr.net'],
  imgSrc: ["'self'", 'https://www.google-analytics.com', 'https://stats.g.doubleclick.net'],
  fontSrc: ['https://maxcdn.bootstrapcdn.com'],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  reportUri: 'https://report-uri.io/report/camjackson'
}));

app.get('/', wrap(views.index));
app.get('/archive/', wrap(views.archive));
app.get('/post/:slug', wrap(views.post));
app.get('/atom.xml', atomFeed.getFeed);
app.get('/write', auth.authorise, wrap(views.write));
app.put('/posts/', auth.authorise, createOrUpdatePost);
app.get('/login', auth.login);
app.get('/oauth2callback', auth.authenticate);
app.get('/loginFailure', wrap(views.loginFailure));
app.get('/logout', auth.logOut);

//For letsencrypt:
app.get('/.well-known/acme-challenge/jHyLoaIrFGlK3SA36gsHNw5Chawno7hQ9YRbzK3CLCw', (req, res) => {
  res.type('text/plain');
  res.send('jHyLoaIrFGlK3SA36gsHNw5Chawno7hQ9YRbzK3CLCw.8RYOGbfpg_HSBz35otVictQhkbvFgKlGr7OIBKFFAdI');
});
app.get('/.well-known/acme-challenge/j1yMOSl0LALz-cMemdbzCg7YUonFAWKDcBQT5fa2vF0', (req, res) => {
  res.type('text/plain');
  res.send('j1yMOSl0LALz-cMemdbzCg7YUonFAWKDcBQT5fa2vF0.8RYOGbfpg_HSBz35otVictQhkbvFgKlGr7OIBKFFAdI');
});

//Redirects for annoying 404s:
const redirects = [
  { from: '/feed', to: '/atom.xml' },
  { from: '/atom', to: '/atom.xml' },
  { from: '/rss', to: '/atom.xml' },
  { from: '/.rss', to: '/atom.xml' },
  { from: '/favicon.png', to: '/favicon.ico' },
  { from: '/new', to: '/' }
];

redirects.forEach((redirect) => {
  app.get(redirect.from, (_, res) => { res.redirect(301, redirect.to)});
});

const port = process.env.PORT ||  8080;
app.listen(port);
log.info(`App listening on port ${port}`);
