'use strict';

angular.module('myEditorApp')
  .controller('FriendsCtrl', function ($scope,Auth,socket,$location) {
  // $http.get('/api/users/me').success(function(u) {
  //     $scope.me = u;
  //     socket.syncUpdates('user', [$scope.me]);
  //   });
  //socket.syncUpdates('User',[$scope]);
  $scope.delete = function(id) {
    Auth.deleteFriend(id);
    $scope.u = Auth.getCurrentUser();
  }
 $scope.u = Auth.getCurrentUser();
  $scope.query ={};
  $scope.submit = function(pattern){
    $location.path('/search_user/'+$scope.query.pattern);
  }

  });
