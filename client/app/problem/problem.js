'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/problem/:id', {
        templateUrl: 'app/problem/problem.html',
        controller: 'ProblemCtrl'
      });
  });
