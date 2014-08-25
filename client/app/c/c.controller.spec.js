'use strict';

describe('Controller: CCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var CCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CCtrl = $controller('CCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
