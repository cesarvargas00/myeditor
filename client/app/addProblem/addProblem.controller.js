'use strict';

angular.module('myEditorApp')
    .controller('AddproblemCtrl', function(Auth, $http, $scope) {
        $scope.description = "";
        $scope.title = "";
        $scope.feedback = false;

        $scope.addProblem = function() {
            $http.post('/api/problems', {
                title: $scope.title,
                description: $scope.description,
                owner_id: Auth.getCurrentUser()._id,
                solution:{
                  java:'',
                  javascript:'',
                  cpp:'',
                  python:''
                },
                tests:''
            })
                .success(function() {
                    $scope.userForm.title.$setPristine();
                    $scope.userForm.content.$setPristine();
                    $scope.description = "";
                    $scope.title = "";
                    $scope.feedback = true;
                })
                .error(function(data, status) {
                    console.log(data);
                    console.log(status);
                });

        };
    });
