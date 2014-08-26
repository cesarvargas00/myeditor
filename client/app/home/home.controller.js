'use strict';

angular.module('myEditorApp')
    .controller('HomeCtrl', function(socket, $http, $scope, Auth, $modal, $location) {
        $scope.problems = [];
        $scope.challenges = [];
        $http.get('/api/problems/').success(function(problems) {
            $scope.problems = problems;
            socket.syncUpdates('problem', $scope.problems);
            $http.get('/api/challenges').success(function(challenges) {
                _(challenges).forEach(function(challenge) {
                    if (challenge.owner_id === Auth.getCurrentUser()._id) {
                        $scope.challenges.push({
                            duration:challenge.duration,
                            problem: _.find(problems, function(problem) {
                                return problem._id === challenge.problem_id;
                            }),
                            friends: _.find(Auth.getCurrentUser().friends, function(friend) {
                                return _(challenge.people).forEach(function(person) {
                                    return friend._id === person.user_id;
                                });
                            })
                        });
                    }
                });
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
            $http.delete('api/problems/' + problem._id);
            //make a ui-bootstrap modal later to ask if really wanna delete problem.
        };

        $scope.challenge = function(problem) {
            // var modalInstance = $modal.open({
            //     templateUrl: 'app/home/homeModal.html',
            //     controller: 'ChallengeModalCtrl',
            //     resolve: {
            //         problem: function() {
            //             return problem;
            //         }
            //     }
            // });
            $location.path('/addChallenge/' + problem._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('problem');
        });
    });
