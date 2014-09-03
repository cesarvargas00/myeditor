'use strict';

angular.module('myEditorApp')
    .controller('CollaborateCtrl', function($scope, $http, $routeParams, Auth, $activityIndicator) {
        $scope.modes = ['java', 'c_cpp'];
        $scope.code = {
          currentMode:'java',
          run:{
            'java':'',
            'c_cpp':''
          },
          solution:{
            'java':'',
            'c_cpp':''
          }
        };
        $scope.tests = {
            content: '',
            currentMode: 'javascript'
        };
        $scope.problem = {};
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            console.log($routeParams.id);
            $scope.problem = problem;
        });

        $scope.beenTested = false;
        $scope.testResult = '';
        var ranOnce = false;
        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                if (!ranOnce) {
                    ranOnce = true;
                } else {
                    return 0;
                }
                var fireRef = new Firebase('my-editor.firebaseio.com/collaborate/' + $routeParams.sId);
                Auth.isLoggedInAsync(function() {
                    var firepad = Firepad.fromACE(fireRef, _ace, {
                        userId: Auth.getCurrentUser().name
                    });
                    console.log('outside');
                    fireRef.on('value', function(dataSnapshot) {
                        console.log('inside', dataSnapshot);
                        var temp = [];
                        dataSnapshot.child('users').forEach(function(d) {
                            temp.push(d.name());
                        });
                        $scope.userList = temp;
                        _.defer(function() {
                            $scope.$apply()
                        });
                    });
                    $scope.codeModeChanged = function() {
                        _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                    };
                })

            }
        };

        $scope.run = function() {
            $scope.submitted = true;
            $scope.problem.run = $scope.code.run;
            $scope.problem.solution = $scope.code.solution;
            $activityIndicator.startAnimating();
            $http({
                method: 'POST',
                url: 'http://54.88.184.168/run',
                data: $scope.problem
            }).success(function(data) {
                $scope.submitted = false;
                $activityIndicator.stopAnimating();
                $scope.output = data;
            });
        };
    });
