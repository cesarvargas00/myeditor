'use strict';

angular.module('myEditorApp')
    .controller('CCtrl', function($scope, $http, $routeParams, Auth) {
$scope.content = {
  code:''
};
        $http.get('/api/challenges/' + $routeParams.id).success(function(challenge) {
            $scope.challenge = challenge;
            console.log(challenge);
            $http.get('api/problems/' + challenge.problem).success(function(problem) {
                $scope.problem = problem;
                var user = _.find(challenge.people, function(person){ return person.user === Auth.getCurrentUser()._id;});
                $scope.content.code = user.solution.java;
            });
        });
    });
