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
            java: 'public class Solution{\n}',
            c_cpp: ''
        }
  },
  run : {
        type: Object,
        default: {
            java: 'public class Run {\n    public static void main(String[] args){\n    System.out.println("Hello World!");\n        }\n    }',
            c_cpp: ''
        }
  },
  date: {
      type: Date,
      default: Date.now
  }
});

module.exports = mongoose.model('Problem', ProblemSchema);