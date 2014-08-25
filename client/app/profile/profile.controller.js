'use strict';

angular.module('myEditorApp')
  .controller('ProfileCtrl', function ($scope, $routeParams, $http,Auth , $modal) {
 function getExampleRef(a) {
           var ref = new Firebase(a);
           var hash = window.location.hash.replace(/#/g, '');
           if (hash) {
              ref = ref.child(hash);
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.name(); // add it as a hash to the URL.
      }
      if (typeof console !== 'undefined')
        console.log('Firebase data: ', ref.toString());
      return ref;
    }
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
        $scope.userList = [];
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.fireRef  = new Firebase('my-editor.firebaseio.com/TEST/4/');
        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {

                // HACK to have the ace instance in the scope...
               var firepad = Firepad.fromACE($scope.fireRef, _ace,{userId:Auth.getCurrentUser().name});

               $scope.fireRef.on('value',function(dataSnapshot){
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
        $scope.open = function() {
          var modalInstance = $modal.open({
            templateUrl: 'components/popup/popup.html',
            controller: 'PopupCtrl',
            resolve: {
              variebl: function () {
                return $scope.items;
              }
            }
          });
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
