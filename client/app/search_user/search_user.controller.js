'use strict';

angular.module('myEditorApp')
  .controller('SearchUserCtrl', function ($http,$scope,$routeParams,Auth,socket) {
    $scope.message = [];
    $scope.submitted = false;
      $scope.add = function(id, $index) {
          Auth.addRequest(id,function(data){
             if(data.message === 'added') {
                $scope.message[$index] = true;
                $scope.submitted = true;
             }
             socket.socket.emit('request',id);
          });

      }
      $http.get('/api/users/search/'+$routeParams.pattern).success(function(docs){
          $scope.docs = docs;
      });
  });
