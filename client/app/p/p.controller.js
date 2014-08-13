'use strict';

angular.module('myEditorApp')
    .controller('PCtrl', function($scope, $routeParams, $http) {
        $scope.modes = ['javascript', 'java', 'c_cpp', 'python'];
        $scope.code = {
            content: 'Helloooo',
            currentMode: 'javascript'
        };
        $scope.tests = {
            content: 'World',
            currentMode: 'javascript'
        };
        $scope.problem = {};
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
        });

        $scope.beenTested = false;
        $scope.testResult = '';

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.tests.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.testsModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.tests.currentMode.toLowerCase());
                };
            }
        };
    });
