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



  $scope.onSubmit = function() {
    Restangular.one('sites', btappConfig.site).one('forms', $stateParams.formName).customPOST($scope.formData, 'records').then(function (result) {
      $state.go('customformsuccess');
    }, function (response) {
      $scope.responseError = 'Error submitting data: ' + response.statusText;
      $scope.responseErrorShow = true;
    });
  };

  $scope.loadForm = function(fName) {
    Restangular.one('sites', btappConfig.site).one('forms', fName).get().then(function (data) {
      $scope.dataform = data;
      $rootScope.title = data.title;
      $scope.formFields = angular.fromJson(data.formFields);
      $scope.formOptions.uniqueFormId = 'form::' + data.name;
    });
  };

  $scope.loadForm($stateParams.formName);

};
