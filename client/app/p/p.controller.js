'use strict';

angular.module('myEditorApp')
    .controller('PCtrl', function($scope, $routeParams, $http, $modal,$activityIndicator) {
        $scope.submitted = false;
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.modes = ['java','c_cpp'];
        $scope.code = {
          run:{
            'java':'',
            'c_cpp':''
          },
          solution:{
            'java':'',
            'c_cpp':''
          }
        };
        $scope.currentMode = 'java'
        $scope.problem = {};
        //first thing being executed
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
            if (problem.solution) {
                $scope.code.solution.java = problem.solution.java; //the first one.
                $scope.code.solution.c_cpp = problem.solution.c_cpp;
            }
            if (problem.run) {
                $scope.code.run.java = problem.run.java;
                $scope.code.run.c_cpp = problem.run.c_cpp;
            }
        });

        $scope.run = function() {
          $scope.submitted = true;
          $scope.problem.run = $scope.code.run;
          $scope.problem.solution = $scope.code.solution;
          $activityIndicator.startAnimating();
          $http({
              method: 'POST',
              url: 'http://54.88.184.168/run',
              data: $scope.problem
          }).success(function(data){
               $scope.submitted = false;
               $activityIndicator.stopAnimating();
               $scope.output = data;
          });
        };
        $scope.save = function() {
           //$scope.problem.solution[$scope.code.currentMode] = $scope.code.content;
            //$scope.problem.tests = $scope.tests.content;
            $scope.problem.run = $scope.code.run;
            $scope.problem.solution = $scope.code.solution;
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
            mode: $scope.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.currentMode.toLowerCase());
                    // Also have to change the code content
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.testsModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.currentMode.toLowerCase());
                    // Also have to change the tests content
                };
            }
        };
    });

var ModalInstanceCtrl = function($scope, $modalInstance,$location) {
    $scope.ok = function() {
        $modalInstance.close('user clicked ok');
         $location.path('/home');
    };
};
