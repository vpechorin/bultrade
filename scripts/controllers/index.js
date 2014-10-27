'use strict';

var app = require('angular').module('btapp');

app.controller('HomeController', require('./home'));
app.controller('DownloadsController', require('./downloads'));
app.controller('PageViewController', require('./pageview'));
app.controller('FormController', require('./form'));
app.controller('FormSuccessController', require('./formsuccess'));
