/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Problem = require('./problem.model');

exports.register = function(socket) {
  Problem.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Problem.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('problem:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('problem:remove', doc);
}