/* global io */
'use strict';

angular.module('myEditorApp')
  .factory('socket', function(socketFactory) {
    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io(null, {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,
      syncUpdatesChallenge:function(user,myChallenges,participatingChallenges){
           socket.on('challenge:save',function(cha){
              if(cha.owner._id == user._id) {
                  myChallenges.push(cha);
              }
              cha.people.forEach(function(u){
                  if(u.user._id == user._id){
                    participatingChallenges.push(cha);
                  }
              })
        });
      },
      syncUpdateUser: function(user){
        socket.on('user:save',function(item){
            if(item._id === user._id) {
              user.friends = item.friends;
              user.request_friends = item.request_friends;
              user.message = item.message;
            }
        });

      },
      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  });