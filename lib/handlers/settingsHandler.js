var marked = require('marked');

var Config = require('../models').Config;

function SettingsHandler(createResponder) {
  this.createResponder = createResponder || require('../helpers').createResponder;
}

SettingsHandler.prototype.getSettings = function(req, res) {
  res.render('settings.jade', {
    marked: marked,
    config: Config.findOne({}),
    errorMessage: req.flash('errorMessage')
  }, this.createResponder(res, 'Error while rendering settings page'))
};

exports.SettingsHandler = SettingsHandler;
