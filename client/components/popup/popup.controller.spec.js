'use strict';

describe('Controller: PopupCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var PopupCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PopupCtrl = $controller('PopupCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
