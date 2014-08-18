/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var user = require('./user.model');

exports.register = function(socket) {
  user.schema.post('save', function (doc) {
     doc.populate({path:'request_friends',select:'_id name'},function(err,u){
      u.populate({path:'friends',select:'_id name email'},function(err,us){
        onSave(socket, us);
      });
    });
  });
  user.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

exports.request = function(socket,list) {
  socket.on('request',function(data){
     if(data in list) {
      list[data].emit("news");
     }

  });
}
function onSave(socket, doc, cb) {
  socket.emit('user:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('user:remove', doc);
}