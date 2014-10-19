'use strict';
var angular = require('angular');
var btappConfig = require('../config');

module.exports = function ($scope, $state, $stateParams, $rootScope, Restangular) {

  $scope.formData = {};
  $scope.dataform = {};
  $scope.formFields = {};
  $scope.formOptions = {
    uniqueFormId: 'formx'
  };

  Restangular.one('sites', btappConfig.site).one('forms', $stateParams.formName).get().then(function (data) {
    $scope.dataform = data;
    $rootScope.title = data.title;
    $scope.formFields = angular.fromJson(data.formFields);
    $scope.formOptions.uniqueFormId = 'form::' + data.name;
  });

  $scope.onSubmit = function() {
    Restangular.one('sites', btappConfig.site).one('forms', $stateParams.formName).customPOST($scope.formData, 'records').then(function (result) {
      // some action on success
      $scope.responseError = '';
    }, function (response) {
      $scope.responseError = 'Error submitting data: ' + response.statusText;
      $scope.responseErrorShow = true;
    });
  };

};
