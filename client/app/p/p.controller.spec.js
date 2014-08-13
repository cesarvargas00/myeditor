'use strict';

describe('Controller: PCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var PCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PCtrl = $controller('PCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
