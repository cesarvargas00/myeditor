'use strict';

angular.module('myEditorApp')
  .controller('ProfileCtrl', function ($scope, $routeParams, $http) {

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

        $scope.beenTested = false;
        $scope.testResult = '';
        var ranFirstTime = true;
        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                if(ranFirstTime){
                var _session = _ace.getSession();
                console.log(_ace);
                var fireRef = new Firebase('my-editor.firebaseio.com/TEST/3');
                var firepad = Firepad.fromACE(fireRef, _ace);
                firepad.imageInsertionUI = false;
                ranFirstTime = false;
              }
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
