'use strict';

angular.module('myEditorApp')
  .controller('CCtrl', function ($scope, $http, $routeParams) {

    $http.get('/api/challenges/' + $routeParams.id).success(function(challenge){
      $scope.challenge = challenge;
      $http.get('api/problems/' + challenge.problem_id).success(function(problem){
          $scope.problem = problem;
      });
    });


  });
