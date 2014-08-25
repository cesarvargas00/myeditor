'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/search/:pattern', auth.isAuthenticated(), controller.search);
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.put('/:id/request',auth.isAuthenticated(),controller.request);
router.put('/collaborate/:pId/problem/:sId/session',auth.isAuthenticated(),controller.collaborate);
router.delete('/:id/request',auth.isAuthenticated(),controller.deleteRequest);
router.put('/:id/add',auth.isAuthenticated(),controller.add);
router.delete('/:id/friend',auth.isAuthenticated(),controller.deleteFriend);
router.delete('/:id/collaborate',auth.isAuthenticated(),controller.deleteColla);
module.exports = router;
