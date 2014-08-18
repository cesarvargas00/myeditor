'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addProblem', {
        templateUrl: 'app/addProblem/addProblem.html',
        controller: 'AddproblemCtrl',
        authenticate: true
      });
  });
