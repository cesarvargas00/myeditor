'use strict';

angular.module('myEditorApp')
    .controller('CCtrl', function($scope, $http, $routeParams, Auth) {

      $scope.modes=['java', 'c_cpp', 'javascript'];

      $scope.code = {
        solution:{
          'java':'helo'
        },
        currentMode:'java'
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

        $http.get('/api/challenges/' + $routeParams.id).success(function(challenge) {
            $scope.challenge = challenge;
            console.log(challenge);
            $http.get('api/problems/' + challenge.problem).success(function(problem) {
                $scope.problem = problem;
                var user = _.find(challenge.people, function(person) {
                    return person.user === Auth.getCurrentUser()._id;
                });
                $scope.code.solution = user.solution;
            });
        });
    });
