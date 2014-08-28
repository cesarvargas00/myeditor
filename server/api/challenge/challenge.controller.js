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
    Challenge.find(function(err, challenges) {
        Problem.find(function(err, problems) {
            User.find(function(err, users) {
                var pMyChallenges = [];
                var pParticipatingChallenges = [];
                _(challenges).forEach(function(challenge) {
                    if (req.user._id.toString() === challenge.owner_id) {
                        pMyChallenges.push(challenge);
                    } else {
                        _(challenge.people).forEach(function(person) {
                            if (person.user_id === req.user._id.toString()) {
                                pParticipatingChallenges.push(challenge);
                                return;
                            }
                        });
                    }
                });

                var result = new ChallengeResult([], []);

                var makeChallengeArray = function(challenges, problems, users) {
                    var r = [];
                    _(challenges).forEach(function(challenge) {
                        var challengeObject = new ChallengeObject(challenge, [], {});
                        challengeObject.problem = _.find(problems, function(problem) {
                            return problem._id.toString() === challenge.problem_id;
                        });
                        _(users).forEach(function(user) {
                            _(challenge.people).forEach(function(person) {
                                if (user._id.toString() === person.user_id) {
                                    challengeObject.users.push(user);
                                }
                            });
                        });
                        r.push(challengeObject);
                    });
                    return r;
                };

                result.myChallenges = makeChallengeArray(pMyChallenges, problems, users);
                result.participatingChallenges = makeChallengeArray(pParticipatingChallenges, problems, users);
                return res.json(result);
            });
        });
    });
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

// Updates an existing challenge in the DB.
exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Challenge.findById(req.params.id, function(err, challenge) {
        if (err) {
            return handleError(res, err);
        }
        if (!challenge) {
            return res.send(404);
        }

        var updated = _.merge(challenge, req.body);
        updated.people = req.body.people; // merge is copying people wrong...
        updated.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, challenge);
        });
    });
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
