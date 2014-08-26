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
                    var friends = [];
                    _(challenge.people).forEach(function(person) {
                        _(Auth.getCurrentUser().friends).forEach(function(friend) {
                            if (person.user_id === friend._id) {
                                friends.push({data:friend, challengeData:person});
                            }
                        });
                    });
                    // must check on server not to get everything
                    if (challenge.owner_id === Auth.getCurrentUser()._id) {
                        $scope.challenges.push({
                            duration: challenge.duration,
                            problem: _.find(problems, function(problem) {
                                return problem._id === challenge.problem_id;
                            }),
                            friends: friends,
                            problem_id: challenge.problem_id,
                            id: challenge._id
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
            $http.delete('api/problems/' + problem._id).success(function(){
              _($scope.challenges).where({problem_id:problem._id}).forEach(function(challenge){
                $http.delete('api/challenges/'+ challenge.id);
              });
            });
            //make a ui-bootstrap modal later to ask if really wanna delete problem.
        };

        $scope.challenge = function(problem) {
            $location.path('/addChallenge/' + problem._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('problem');
        });
    });
