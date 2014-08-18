'use strict';

describe('Controller: SearchUserCtrl', function () {

  // load the controller's module
  beforeEach(module('myEditorApp'));

  var SearchUserCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SearchUserCtrl = $controller('SearchUserCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
