'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/collaborate/:id/session/:sId', {
        templateUrl: 'app/collaborate/collaborate.html',
        controller: 'CollaborateCtrl'
      });
  });
