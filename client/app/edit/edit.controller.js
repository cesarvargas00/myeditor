'use strict';

angular.module('myEditorApp')
  .controller('EditCtrl', function ($scope,$http,$routeParams,$modal,$location) {
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.problem = {};
        //first thing being executed
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
        });

        $scope.save = function() {
           // $scope.problem.tests = $scope.tests.content;
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


    });
