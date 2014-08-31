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

        $scope.modes = ['java', 'c_cpp'];
        $scope.code = {
          run:{
            'java':'',
            'c_cpp':''
          },
          solution:{
            'java':'',
            'c_cpp':''
          },
          currentMode: 'java'
        }

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
                people.push({user:friend._id,solution:$scope.code.solution});
            });

            $http.post('api/challenges', {
                owner: Auth.getCurrentUser()._id,
                problem: problem,
                people: people,
                run:$scope.code.run,
                duration: parseInt($scope.timeLength)
            }).success(function() {
                $location.path('/home');
            });
        };

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                    console.log('CHANGED!!!');
                    // Also have to change the code content
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                  console.log('CHANGED!!!');
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                    // Also have to change the tests content
                };
            }
        };
    });
