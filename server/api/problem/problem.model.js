'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProblemSchema = new Schema({
  title: String,
  owner_id: String,
  solved: {
      type: Boolean,
      default: false
  },
  description: String,
  solution: {
      "java": String,
      "javascript": String,
      "cpp": String,
      "python": String
  },
  tests: String,
  date: {
      type: Date,
      default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);