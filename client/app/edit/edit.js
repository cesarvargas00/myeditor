'use strict';

angular.module('myEditorApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/edit/:id', {
        templateUrl: 'app/edit/edit.html',
        controller: 'EditCtrl'
      });
  });
