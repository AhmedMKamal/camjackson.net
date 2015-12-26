require('mongoose').connect(process.env.MONGOLAB_URI || 'mongodb://localhost/camjackson-net');

process.env.LOGGING = true;
process.env.SESSION_SECRET = 'super duper secret'; //TODO!
process.env.SITE_TITLE = process.env.SITE_TITLE || 'title';
process.env.SITE_HEADING = process.env.SITE_HEADING || 'heading';
process.env.SITE_SUB_HEADING = process.env.SITE_SUB_HEADING || 'sub-heading';
process.env.SITE_DOMAIN = process.env.SITE_DOMAIN || 'example.com';
process.env.GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || '';

const App = require('./src/app').App;
new App().start();
