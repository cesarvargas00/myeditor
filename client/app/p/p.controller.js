'use strict';

angular.module('myEditorApp')
    .controller('PCtrl', function($scope, $routeParams, $http, $modal) {
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.modes = ['java'];
        $scope.code = {
            content: '',
            currentMode: 'java'
        };
        $scope.tests = {
            content: '',
            currentMode: 'java'
        };
        $scope.problem = {};
        //first thing being executed
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
                var modalInstance = $modal.open({
                    templateUrl: '/app/p/modal.html',
                    size: 'md',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function(a) {
                    console.log(a);
                });
            }).
            error(function(data, status, headers, config) {
                console.log("error, son...");
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

var ModalInstanceCtrl = function($scope, $modalInstance) {
    $scope.ok = function() {
        $modalInstance.close('user clicked ok');
    };
};
