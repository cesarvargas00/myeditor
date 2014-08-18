'use strict';

angular.module('myEditorApp')
  .controller('HomeCtrl', function (socket, $http, $scope, Auth) {
    $scope.problems = [];
    $http.get('/api/problems/').success(function(problems){
      $scope.problems = problems;
      socket.syncUpdates('problem', $scope.problems);
    });

    $scope.deleteProblem = function(problem){
      $http.delete('api/problems/' + problem._id);
      //make a ui-bootstrap modal later to ask if really wanna delete problem.
    };

    $scope.deleteProblem = function(problem){
      $http.delete('api/problems/' + problem._id);
      //make a ui-bootstrap modal later to ask if really wanna delete problem.
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('problem');
    });
  });
