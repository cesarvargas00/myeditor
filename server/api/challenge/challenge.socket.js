/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Challenge = require('./challenge.model');

exports.register = function(socket) {
  Challenge.schema.post('save', function (doc) {
     doc.populate({path:'owner', select:'_id name email'})
        .populate('problem')
        .populate({path:'people.user', select:'_id name email'},function(err,d){
            onSave(socket,d);
        });
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