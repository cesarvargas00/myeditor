'use strict';

angular.module('myEditorApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      friendReq:{
        method:'PUT',
        params:{
          controller:'request'
        }
      },
      ignoreReq:{
        method:'DELETE',
        params: {
          controller:'request'
        }
      },
      deleteFriend:{
        method: 'DELETE',
        params:{
          controller:'friend'
        }
      },
      addFriend: {
        method:'PUT',
        params:{
          controller:'add'
        }
      },
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
