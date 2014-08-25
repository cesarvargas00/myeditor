'use strict';

describe('Controller: AddchallengeCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var AddchallengeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddchallengeCtrl = $controller('AddchallengeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
