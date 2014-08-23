'use strict';

angular.module('myEditorApp')
  .controller('CollaborateCtrl', function ($scope,$http,$routeParams,Auth) {
     $scope.modes = ['javascript', 'java', 'c_cpp', 'python'];
        $scope.code = {
            content: '',
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
              var fireRef = new Firebase('my-editor.firebaseio.com/collaborate/'+$routeParams.sId);
               var firepad = Firepad.fromACE(fireRef, _ace,{userId:Auth.getCurrentUser().name});

                  fireRef.on('value',function(dataSnapshot){
                   var temp = [];
                   dataSnapshot.child('users').forEach(function(d){
                     temp.push(d.name());
                   });
                   $scope.userList = temp;
                  _.defer(function(){$scope.$apply();});
                });

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
