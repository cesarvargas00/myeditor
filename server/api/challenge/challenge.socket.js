/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Challenge = require('./challenge.model');

exports.register = function(socket) {
  Challenge.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Challenge.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('challenge:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('challenge:remove', doc);
}