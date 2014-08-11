'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/friends', {
        templateUrl: 'app/friends/friends.html',
        controller: 'FriendsCtrl'
      });
  });
