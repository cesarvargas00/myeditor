'use strict';

angular.module('myEditorApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth,socket) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/home'
    }];

    $scope.add = function(id){
        Auth.addFriend(id);
    }
    $scope.ignore = function(id) {
        Auth.ignoreRequest(id);
    }
    $scope.acceptColla = function(i){
       $location.path('/collaborate/' + i.problem+'/session/' +  i.content);
    }

    $scope.ignoreColla = function(i){
        Auth.ignoreColla(i._id);
    }
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.user = Auth.getCurrentUser();
     socket.socket.emit('info',$scope.user._id);
     socket.socket.on('news',function(){
      $scope.news = true;
     });
    socket.syncUpdateUser($scope.user);
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });