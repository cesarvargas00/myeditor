'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    user.populate({path:'request_friends',select:'_id name'},function(err,u){
      u.populate({path:'friends',select:'_id name email'},function(err,us){
          res.json(us);
      });
    });

  });
};

exports.add = function(req,res,next) {
   var userId = req.user._id;
   User.findById(userId,function(err,user){
      for(var i in user.request_friends){
        if(user.request_friends[i] == req.params.id) {
          user.request_friends.splice(i,1);
          break;
        }
      }
      user.friends.push(req.params.id);
      user.save(function(err){
        User.findById(req.params.id,function(err,doc){
           for(var i in doc.request_friends){
             if(doc.request_friends[i] == userId) {
               doc.request_friends.splice(i,1);
               break;
             }
           }
           doc.friends.push(userId);
           doc.save(function(err){
               if (err) return validationError(res, err);
               res.send(200);
           });
        });
      });
   });
};
exports.request = function(req,res,next) {
    var userId = req.user._id;
    var temp = req.params.id;
    User.findById(temp,function(err,d){
        // for(var i =0 ;i<d.request_friends.length ; i++) {
        //      if(String(d.request_friends[i]) === String(userId)) {
        //       return res.json({message:'added'});
        //      }
        // }
        d.request_friends.push(userId);
        d.save(function(err) {
        if (err) return validationError(res, err);
        res.json({message:'added'});
      });
    });
};


exports.deleteRequest= function(req,res,next) {
    var userId = req.user._id;
    var temp = req.params.id;
    User.findById(userId,function(err,d){
        for(var i in d.request_friends){
            if(String(d.request_friends[i]) === String(temp)) {
               d.request_friends.splice(i,1);
               break;
            }
        }
        d.save(function(err){
        if (err) return validationError(res, err);
        res.send(200);
      });
    });
};
exports.deleteFriend = function(req,res,next){
    var userId = req.user._id;
    User.findById(userId,function(err,user){
      for(var i in user.friends) {
          if( req.params.id == user.friends[i]) {
            user.friends.splice(i,1);
            break;
          }
      }
      user.save(function(err){
        if (err) return validationError(res, err);
        res.send(200);
      });
    });
};
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};


exports.search = function(req, res, next){
   var pattern = new RegExp('.*'+req.params.pattern+'.*','i');
   User.findById(req.user._id,function(err,user){
      User.find({'name':pattern},function(err,users){
        res.json(users.map(function(i){
          var temp = i.userData;
          temp.button = 'add';
          user.friends.forEach(function(e){
              if(String(e) === String(temp._id)) {
                temp.button = 'remove';
              }
          });
          i.request_friends.forEach(function(e){
              if(String(e) === String(user._id)) {
                temp.button = 'requesting';
              }
          });
          console.log(i.request_friends + "|||" + temp._id);
          return temp;
      }));
   });
   });
}

