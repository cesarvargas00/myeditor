'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        authenticate: true
      });
  });
