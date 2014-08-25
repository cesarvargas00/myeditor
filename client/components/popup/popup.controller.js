'use strict';

angular.module('myEditorApp')
  .controller('PopupCtrl', function ($scope,Auth,$modalInstance,$location,variable,$http,socket) {
    $scope.u = Auth.getCurrentUser();
    $scope.ok = function () {
       var baseRef = new Firebase('my-editor.firebaseio.com/collaborate/');
       var childRef = baseRef.push();
       var temp =$scope.o.selectedFriends.map(function(i){
            return i._id;
       });
       $http.put('/api/users/collaborate/' + variable + '/problem/' + childRef.name() + '/session',{data:temp}).success(function(){
         $scope.o.selectedFriends.forEach(function(d){
            socket.socket.emit('request',d._id);
         });
        $location.path('/collaborate/' + variable+'/session/' +  childRef.name());
         $modalInstance.close();
       });
       //
      //
    };
    $scope.o={selectedFriends:[]};
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
