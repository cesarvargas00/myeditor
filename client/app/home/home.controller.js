'use strict';

angular.module('myEditorApp')
    .controller('HomeCtrl', function(socket, $http, $scope, Auth, $modal, $location, $timeout) {
        $scope.problems = [];
        $scope.myChallenges = [];
        $scope.participatingChallenges = [];
        $scope.timers = [];

        var myChallenges = [];
        var participatingChallenges = [];
        $scope.edit = function(problem){
            $location.path('/edit/'+problem._id);
        }

        $scope.isMyProblem = function(problem){
            return problem.owner_id === Auth.getCurrentUser()._id;
        };

        var checkIfFinished = function(challenges){
          _(challenges).each(function(c){
                    _(c.people).each(function(p){
                      if (p.hasStarted && !p.hasFinished){
                        var now = new Date();
                        var started = new Date(p.timeStartedChallenge);
                        var elapsed = now - started;
                        if(elapsed > c.duration * 60000){
                          p.hasFinished = true;
                        }
                      }
                    });
                });
        };

        $http.get('/api/problems/').success(function(problems) {
            $scope.problems = problems;
            socket.syncUpdates('problem', $scope.problems);

            $http.get('api/challenges/').success(function(c) {
                $scope.myChallenges = c.myChallenges;
                checkIfFinished($scope.myChallenges);
                socket.syncUpdates('challenge', $scope.myChallenges);
                $scope.participatingChallenges = c.participatingChallenges;
                checkIfFinished($scope.participatingChallenges);
                // socket.syncUpdates('challenge', $scope.participatingChallenges);
                socket.syncUpdatesChallenge(Auth.getCurrentUser(),$scope.myChallenges,$scope.participatingChallenges);
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
          console.log(challenge);
            _(challenge.people).each(function(person) {
              console.log(person.hasStarted);
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
