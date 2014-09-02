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
       type: Object,
        default: {
            java: '',
            c_cpp: ''
        }
  },
  run : {
        type: Object,
        default: {
            java: '',
            c_cpp: ''
        }
  },
  date: {
      type: Date,
      default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);