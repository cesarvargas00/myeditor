'use strict';

angular.module('myEditorApp')
  .controller('HomeCtrl', function (socket, $http, $scope, Auth,$modal) {
    $scope.problems = [];
    $http.get('/api/problems/').success(function(problems){
      $scope.problems = problems;
      socket.syncUpdates('problem', $scope.problems);
    });
    $scope.open = function(problem) {
          var modalInstance = $modal.open({
            templateUrl: 'components/popup/popup.html',
            controller: 'PopupCtrl',
            resolve: {
              variable:function(){
                return problem._id;
              }
            }
          });
        };
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
