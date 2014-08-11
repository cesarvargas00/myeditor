'use strict';

describe('Controller: ProblemCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var ProblemCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProblemCtrl = $controller('ProblemCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
