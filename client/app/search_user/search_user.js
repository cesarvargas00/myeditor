'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/search_user/:pattern', {
        templateUrl: 'app/search_user/search_user.html',
        controller: 'SearchUserCtrl'
      });
  });
