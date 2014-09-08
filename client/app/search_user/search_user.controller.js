'use strict';

angular.module('myEditorApp')
  .controller('SearchUserCtrl', function ($http,$scope,$routeParams,Auth,socket) {
    $scope.message = [];
      $scope.add = function(id, $index,d) {
          Auth.addRequest(id,function(data){
             if(data.message === 'added') {
                $scope.message[$index] = true;
                d.submitted = true;
             }
             socket.socket.emit('request',id);
          });

      }
      $http.get('/api/users/search/'+$routeParams.pattern).success(function(docs){
          $scope.docs = docs;
      });
  });
