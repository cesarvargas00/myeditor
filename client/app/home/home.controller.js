'use strict';

angular.module('myEditorApp')
  .controller('HomeCtrl', function (socket, $http, $scope, Auth,$modal,$location) {
    $scope.problems = [];
    $http.get('/api/problems/').success(function(problems){
      $scope.problems = problems;
      socket.syncUpdates('problem', $scope.problems);
    });
    $scope.edit= function(problem){
      $location.path('/edit/'+problem._id);
    }
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

    $scope.challenge = function(problem){
      $http.post('api/challenges', {
        owner_id:Auth.getCurrentUser._id,
        problem_id:problem._id,
        people: [{
          user_id:Auth.getCurrentUser()._id
        }]
      }).success(function(data){
        console.log('userId',Auth.getCurrentUser()._id);
        console.log('problemId',data._id);
      });
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('problem');
    });
  });
