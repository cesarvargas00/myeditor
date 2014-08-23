'use strict';

describe('Controller: CollaborateCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var CollaborateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CollaborateCtrl = $controller('CollaborateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
