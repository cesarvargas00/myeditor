'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
    owner_id: String,
    problem_id: String,
    people: [{
        user_id: String,
        timeStartedChallenge: Date,
        solution: {type:Object, default:{
          java:'',
          python:'',
          cpp:'',
          javascript:''
        }},
        hasStarted: {type:Boolean, default:false},
        hasFinished: {type:Boolean, default:false},
        gotItRight: {type:Boolean, default:false}
    }],
    duration: Number
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
