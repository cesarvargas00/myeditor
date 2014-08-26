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
            var problem_id;
            if (!$scope.hasId) {
                problem_id = $scope.selectedProblem._id;
            } else {
                problem_id = $routeParams.id;
            }

            var people = [];
            _(friends).forEach(function(friend) {
                people.push({user_id:friend._id});
            });

            $http.post('api/challenges', {
                owner_id: Auth.getCurrentUser()._id,
                problem_id: problem_id,
                people: people,
                duration: parseInt($scope.timeLength)
            }).success(function() {
                $location.path('/home');
            });
        };
    });
