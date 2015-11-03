writeitdown
===========
[![Build Status](https://snap-ci.com/camjackson/writeitdown/branch/master/build_image)](https://snap-ci.com/camjackson/writeitdown/branch/master)

Blogging with markdown, complete with code highlighting!

For a demo, see [camjackson.net](http://camjackson.net)

### Dependencies:

1. node.js + npm
2. mongodb

### Setup
1. `npm install`
2. Start `mongod` in a separate terminal.
3. `bin/seed` (seeds localhost by default, override with env DB_CONNECTION_STRING)

### Tests:
`npm test`

### Run:
`npm start`

Default login is admin/admin
