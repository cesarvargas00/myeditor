'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/c/:id', {
        templateUrl: 'app/c/c.html',
        controller: 'CCtrl'
      });
  });
