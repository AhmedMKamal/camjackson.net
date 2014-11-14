require('mongoose').connect(process.env.MONGOLAB_URI || 'mongodb://localhost/writeitdown');

process.env.LOGGING = true;
process.env.SESSION_SECRET = 'super duper secret'; //TODO!
process.env.SITE_TITLE = process.env.SITE_TITLE || 'title';
process.env.SITE_HEADING = process.env.SITE_HEADING || 'heading';
process.env.SITE_DOMAIN = process.env.SITE_DOMAIN || 'example.com';

var WriteItDown = require('./lib/writeitdown').WriteItDown;
new WriteItDown({}).start();
