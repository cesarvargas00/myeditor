'use strict';

angular.module('myEditorApp')
    .controller('AddchallengeCtrl', function($http, $scope, Auth) {
        $scope.problems = [];
        $scope.friends = [];
        _(Auth.getCurrentUser().friends).forEach(function(friend) {
            $scope.friends.push(_.assign(friend, {
                ticked: false
            }));
        });

        $http.get('api/problems').success(function(problems) {
            $scope.problems = problems;
        });
        $scope.metricTime = '';
        $scope.timeLength = '';
        $scope.selectedProblem = {};
    });
