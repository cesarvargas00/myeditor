'use strict';

describe('Controller: AddproblemCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var AddproblemCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddproblemCtrl = $controller('AddproblemCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
