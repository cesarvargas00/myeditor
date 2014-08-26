'use strict';
angular.module('myEditorApp')
    .controller('ChallengeModalCtrl', function(problem, Auth, $scope, $location, $modalInstance) {
        $scope.inputs = ['foo', 'bar'];
        $scope.methodName = '';
        $scope.returnType = '';

        $scope.problems = [];
        $scope.friends = Auth.getCurrentUser().friends;
        $scope.selectedFriends = [];
        $scope.metricTime = '';
        $scope.timeLength = '';

        var save = function() {
          var friends = $scope.selectedFriends;

            $http.post('api/challenges', {
                owner_id: Auth.getCurrentUser._id,
                problem_id: problem._id,
                people: [{
                    user_id: Auth.getCurrentUser()._id
                }]
            }).success(function(data) {
                // console.log('userId', Auth.getCurrentUser()._id);
                // console.log('problemId', data._id);
                location.path('/c/' + data._id);
                $modalInstance.close();
            });
        };

    });
