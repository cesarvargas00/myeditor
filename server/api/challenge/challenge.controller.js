'use strict';

var _ = require('lodash');
var Challenge = require('./challenge.model');
var Problem = require('../problem/problem.model');
var User = require('../user/user.model');
var async = require('async');

var ChallengeResult = function(mc, pc) {
    this.myChallenges = mc;
    this.participatingChallenges = pc;
};

var ChallengeObject = function(cd, u, p) {
    this.challengeData = cd;
    this.users = u;
    this.problem = p;
};

// Get list of challenges
exports.index = function(req, res) {
    Challenge
        .find({
            owner: req.user._id
        })
        .populate('owner', '_id name email')
        .populate('problem')
        .populate('people.user', '_id name email')
        .exec(function(err, myChallenges) {
            Challenge
                .find({
                    'people.user': req.user._id
                })
                .populate('owner', '_id name email')
                .populate('problem')
                .populate('people.user', '_id name email')
                .exec(function(err, participatingChallenges) {
                    return res.json({
                        myChallenges: myChallenges,
                        participatingChallenges: participatingChallenges
                    });

                });
            //
        });
    //TODO
    // Challenge.find({people.user:req.user._id}, function(err,challenges){
    //   challengesImParticipating = challenges;
    // });


    // Challenge.find(function(err, challenges) {
    //     Problem.find(function(err, problems) {
    //         User.find(function(err, users) {
    //             var pMyChallenges = [];
    //             var pParticipatingChallenges = [];
    //             _(challenges).forEach(function(challenge) {
    //                 if (req.user._id.toString() === challenge.owner_id) {
    //                     pMyChallenges.push(challenge);
    //                 } else {
    //                     _(challenge.people).forEach(function(person) {
    //                         if (person.user_id === req.user._id.toString()) {
    //                             pParticipatingChallenges.push(challenge);
    //                             return;
    //                         }
    //                     });
    //                 }
    //             });

    //             var result = new ChallengeResult([], []);

    //             var makeChallengeArray = function(challenges, problems, users) {
    //                 var r = [];
    //                 _(challenges).forEach(function(challenge) {
    //                     var challengeObject = new ChallengeObject(challenge, [], {});
    //                     challengeObject.problem = _.find(problems, function(problem) {
    //                         return problem._id.toString() === challenge.problem_id;
    //                     });
    //                     _(users).forEach(function(user) {
    //                         _(challenge.people).forEach(function(person) {
    //                             if (user._id.toString() === person.user_id) {
    //                                 challengeObject.users.push(user);
    //                             }
    //                         });
    //                     });
    //                     r.push(challengeObject);
    //                 });
    //                 return r;
    //             };

    //             result.myChallenges = makeChallengeArray(pMyChallenges, problems, users);
    //             result.participatingChallenges = makeChallengeArray(pParticipatingChallenges, problems, users);
    //             return res.json(result);
    //         });
    //     });
    // });
};

// Get a single challenge
exports.show = function(req, res) {
    Challenge.findById(req.params.id, function(err, challenge) {
        if (err) {
            return handleError(res, err);
        }
        if (!challenge) {
            return res.send(404);
        }
        return res.json(challenge);
    });
};

// Creates a new challenge in the DB.
exports.create = function(req, res) {
    Challenge.create(req.body, function(err, challenge) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, challenge);
    });
};

 function dhm(t){
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = '0' + Math.floor( (t - d * cd) / ch),
        m = '0' + Math.round( (t - d * cd - h * ch) / 60000);
    return [d, h.substr(-2), m.substr(-2)].join(':');
};
exports.getTime = function(req,res) {
    Challenge.findById(req.params.id,function(err,c){
        for(var i =0;i <c.people.length;i++) {
          if(c.people[i].user.toString() === req.user._id.toString()) {
            var rm = dhm(Date.now() - c.people[i].timeStartedChallenge);
            rm = rm > 0? rm :0
            return res.json(200,{t:rm});
          }
        }
    })
}

// Updates an existing challenge in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    var info = req.body;
    console.log(info);
    Challenge.findById(req.params.id,function(err,data){
        for(var i =0 ; i < data.people.length;i++) {
            if(data.people[i].user.toString() === info.user._id) {
                data.people[i].hasFinished = info.hasFinished;
                data.people[i].hasStarted = info.hasStarted;
                data.people[i].timeStartedChallenge = info.timeStartedChallenge;
            }
        }
        data.save(function(err){
            if(err) return handleError(res, err);
            data.populate('owner', '_id name email')
                .populate('problem')
                .populate('people.user', '_id name email',function(err,d){
                    return res.json(200,d);
                });
        });
    })
};

exports.merge = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    Challenge.findById(req.params.id,function(err,challenge){
        challenge = _.merge(challenge, req.body);
        challenge.save(function(err){
            if(err) return handleError(res, err);
            return res.json(200);
        });
    })
};

// Deletes a challenge from the DB.
exports.destroy = function(req, res) {
    Challenge.findById(req.params.id, function(err, challenge) {
        if (err) {
            return handleError(res, err);
        }
        if (!challenge) {
            return res.send(404);
        }
        challenge.remove(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}
