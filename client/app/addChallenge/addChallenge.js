'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addChallenge', {
        templateUrl: 'app/addChallenge/addChallenge.html',
        controller: 'AddchallengeCtrl'
      });
  });
