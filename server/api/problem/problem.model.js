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
  // permaLink: String, //this is the link of the problem. We should link it like
  // // /username/problems/8726475  <---- this should be the sharing permalink
  // // where 8726475 is the problem id. What do you think?
  // //
  date: {
      type: Date,
      default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);