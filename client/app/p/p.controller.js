'use strict';

angular.module('myEditorApp')
    .controller('PCtrl', function($scope, $routeParams, $http) {
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.modes = ['java'];
        $scope.code = {
            content: 'Write the code here...',
            currentMode: 'java'
        };
        $scope.tests = {
            content: 'Write the tests here...',
            currentMode: 'java'
        };
        $scope.problem = {};
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
            if (problem.solution) {
                $scope.code.content = problem.solution.java; //the first one.
            }
            if (problem.tests) {
              $scope.tests.content = problem.tests;
            }
        });

        $scope.save = function() {
            $scope.problem.solution[$scope.code.currentMode] = $scope.code.content;
            $scope.problem.tests = $scope.tests.content;
            $http({
                method: 'PUT',
                url: '/api/problems/' + $scope.problem._id,
                data: $scope.problem
            }).
            success(function(data, status, headers, config) {
                console.log("Successfuly saved!");
                //TODO: Have to make some feedback message. Modal?
            }).
            error(function(data, status, headers, config) {
                console.log("error, son...");
                //TODO: Have to make some feedback message. Modal?
            });
        };

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                    // Also have to change the code content
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.tests.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.testsModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.tests.currentMode.toLowerCase());
                    // Also have to change the tests content
                };
            }
        };
    });
