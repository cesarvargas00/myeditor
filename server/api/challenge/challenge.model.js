'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'Problem'
    },
    people: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        timeStartedChallenge: Date,
        solution: {
            type: Object,
            default: {
                java: '',
                c_cpp: ''
            }
        },
        hasStarted: {
            type: Boolean,
            default: false
        },
        hasFinished: {
            type: Boolean,
            default: false
        },
        gotItRight: {
            type: Boolean,
            default: false
        },
        score: {
            type: Number,
            default: 0
        },
        totalCases: {
            type: Number,
            default: 0
        },
        passingTestCases: {
            type: Number,
            default: 0
        },
    }],
    duration: Number,
    run: {
        type: Object,
        default: {
            java: '',
            c_cpp: ''
        }
    },
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
