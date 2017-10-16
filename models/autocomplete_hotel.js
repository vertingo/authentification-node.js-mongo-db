var mongoose = require('mongoose');


// Person schema
var Hotel = new mongoose.Schema({
  hotel: {type: String, required: true},
});

mongoose.model('Person', Person);
var Person = exports.Person = mongoose.model('Person');