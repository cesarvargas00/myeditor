/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');

// When the user disconnects.. perform this
function onDisconnect(socket,list) {
  for(var i in list) {
      if(list[i].id == socket.id) {
        delete list[i];
        break;
      }
  }
}

// When the user connects.. perform this
function onConnect(socket,list) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    list[data] = socket;
    require('../api/user/user.socket').request(socket,list);
    console.log('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  // Insert sockets below
  require('../api/problem/problem.socket').register(socket);
  require('../api/thing/thing.socket').register(socket);
  require('../api/user/user.socket').register(socket);
}

module.exports = function (socketio) {
  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  // socketio.use(require('socketio-jwt').authorize({
  //   secret: config.secrets.session,
  //   handshake: true
  // }));
  var user_list = {};
  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.log('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket,user_list);
    console.log('[%s] CONNECTED', socket.address);
  });
};