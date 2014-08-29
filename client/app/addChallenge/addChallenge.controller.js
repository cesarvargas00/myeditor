'use strict';

angular.module('myEditorApp')
    .controller('AddchallengeCtrl', function($http, $location, $scope, Auth, $routeParams) {
        $scope.problems = [];
        $scope.friends = Auth.getCurrentUser().friends;
        $scope.selectedFriends = [];
        $scope.hasId = typeof $routeParams.id !== 'undefined';
        if (!$scope.hasId) {
            $http.get('api/problems').success(function(problems) {
                $scope.problems = problems;
            });
        }

        $scope.timeLength = '';
        $scope.selectedProblem = {};

        $scope.save = function() {
            var friends = $scope.selectedFriends;
            var problem;
            if (!$scope.hasId) {
                problem = $scope.selectedProblem._id;
            } else {
                problem = $routeParams.id;
            }

            var people = [];
            _(friends).forEach(function(friend) {
                people.push({user:friend._id});
            });

            $http.post('api/challenges', {
                owner: Auth.getCurrentUser()._id,
                problem: problem,
                people: people,
                duration: parseInt($scope.timeLength)
            }).success(function() {
                $location.path('/home');
            });
        };
    });
