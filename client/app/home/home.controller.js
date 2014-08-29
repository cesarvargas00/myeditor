'use strict';

angular.module('myEditorApp')
    .controller('HomeCtrl', function(socket, $http, $scope, Auth, $modal, $location) {
        $scope.problems = [];
        $scope.myChallenges = [];
        $scope.participatingChallenges = [];

        var myChallenges = [];
        var participatingChallenges = [];
        $scope.edit= function(problem){
            $location.path('/edit/'+problem._id);
        }
        $http.get('/api/problems/').success(function(problems) {
            $scope.problems = problems;
            socket.syncUpdates('problem', $scope.problems);

            $http.get('api/challenges/').success(function(c) {
                $scope.myChallenges = c.myChallenges;
                $scope.participatingChallenges = c.participatingChallenges;
            });
        });

        $scope.open = function(problem) {
            var modalInstance = $modal.open({
                templateUrl: 'components/popup/popup.html',
                controller: 'PopupCtrl',
                resolve: {
                    variable: function() {
                        return problem._id;
                    }
                }
            });
        };
        $scope.deleteProblem = function(problem) {
            $http.delete('api/problems/' + problem._id).success(function() {
                _($scope.challenges).where({
                    problem_id: problem._id
                }).forEach(function(challenge) {
                    $http.delete('api/challenges/' + challenge.id);
                });
            });
            //make a ui-bootstrap modal later to ask if really wanna delete problem.
        };

        $scope.challenge = function(problem) {
            $location.path('/addChallenge/' + problem._id);
        };

        $scope.takeChallenge = function(challenge) {
            _(challenge.people).each(function(person) {
                if (!person.hasStarted) {
                    if (person.user._id === Auth.getCurrentUser()._id) {
                        person.hasStarted = true;
                        person.timeStartedChallenge = new Date();
                        $http.put('api/challenges/' + challenge._id, challenge).success(function(data) {
                            $location.path('/c/' + challenge._id);
                        });
                    }
                } else {
                    if (person.user._id === Auth.getCurrentUser()._id) {
                        var now = new Date();
                        var limitDate = new Date(person.timeStartedChallenge);
                        limitDate.setSeconds(now.getSeconds() + challenge.duration * 60);
                        if (now < limitDate) {
                            $location.path('/c/' + challenge._id);
                        } else {
                            if (!person.hasFinished) {
                                person.hasFinished = true;
                                $http.put('api/challenges/' + challenge._id, challenge).success(function(data) {
                                    $location.path('/home'); //refresh not working?
                                });
                            }
                        }
                    }
                }
            });

            // $location.path('/c/' + challenge.challengeData._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('problem');
        });
    });
