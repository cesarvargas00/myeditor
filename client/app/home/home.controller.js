'use strict';

angular.module('myEditorApp')
  .controller('HomeCtrl', function ($http, $scope, Auth) {
    $scope.problems = [];
    $http.get('/api/problems/').success(function(problems){
      console.log(problems);
      $scope.problems = problems;
    });

  });
