'use strict';

angular.module('myEditorApp')
    .controller('CCtrl', function($scope, $http, $routeParams, Auth, $timeout, $activityIndicator, $modal) {
        $scope.checkTime = function() {
            $http.get('/api/challenges/' + $routeParams.id + '/time/')
                .success(function(t) {
                    $scope.remainingTime = t;
                    console.log(t);
                    $scope.hideTime = false;
                    $timeout(function() {
                        $scope.hideTime = true;
                    }, 4000);
                });
        }
        $scope.modes = ['java', 'c_cpp', 'javascript'];
        $scope.hideTime = true;
        $scope.code = {
            solution: {
                'java': 'helo'
            },
            currentMode: 'java'
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
            $http.get('api/problems/' + challenge.problem).success(function(problem) {
                $scope.problem = problem;
                var user = _.find(challenge.people, function(person) {
                    return person.user === Auth.getCurrentUser()._id;
                });
                $scope.code.solution = user.solution;
            });
        });

        $scope.run = function() {
            $scope.submitted = true;
            $scope.problem.run = $scope.challenge.run;
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

        $scope.save = function() {
            $scope.submitted = true;
            $scope.problem.run = $scope.challenge.run;
            $scope.problem.solution = $scope.code.solution;
            $http({
                method: 'POST',
                url: 'http://54.88.184.168/run',
                data: $scope.problem
            }).success(function(data) {
                $scope.submitted = false;
                $activityIndicator.stopAnimating();
                _($scope.challenge.people).each(function(person) {
                    if (person.user.toString() === Auth.getCurrentUser()._id.toString()) {
                        person.solution = $scope.code.solution;
                        person.hasFinished = true;
                        console.log(data);
                        person.score = data.result.score;
                    }
                });
                $http({
                    method: 'PATCH',
                    url: '/api/challenges/' + $scope.challenge._id,
                    data: $scope.challenge
                }).
                success(function(data, status, headers, config) {
                    var modalInstance = $modal.open({
                        templateUrl: '/app/c/modal.html',
                        size: 'md',
                        controller: ModalInstanceCtrl
                    });
                    modalInstance.result.then(function(a) {
                        console.log(a);
                    });
                    console.log("saved");
                }).
                error(function(data, status, headers, config) {});
            });
        };
    });

var ModalInstanceCtrl = function($modalInstance) {
    $scope.ok = function() {
        $modalInstance.close('user clicked ok');
    };
};
