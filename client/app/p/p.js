'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/p/:id', {
        templateUrl: 'app/p/p.html',
        controller: 'PCtrl',
        authenticate:true
      });
  });
