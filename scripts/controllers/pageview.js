'use strict';
var btappConfig = require('../config');
var angular = require('angular');

module.exports = function ($scope, $state, $stateParams, $rootScope, Restangular) {
  $scope.page = {};
  $scope.subpages = [];

  $scope.formData = {};
  $scope.dataform = {};
  $scope.formFields = {};
  $scope.formOptions = {
    uniqueFormId: 'formx'
  };

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + '/' + $scope.page.siteId + f.directoryPath + '/' + f.name;
  };

  $scope.getImageHeight = function(im, maxHeight) {
    return (im.height > maxHeight) ? maxHeight : im.height;
  };

  $scope.loadFormById = function(fId) {
    Restangular.one('sites', btappConfig.site).one('customform', fId).get().then(function (data) {
      $scope.dataform = data;
      $scope.formFields = angular.fromJson(data.formFields);
      $scope.formOptions.uniqueFormId = 'form::' + data.name;
    });
  };

  $scope.onFormSubmit = function() {
    Restangular.one('sites', btappConfig.site).one('forms', $scope.dataform.name).customPOST($scope.formData, 'records').then(function (result) {
      $state.go('customformsuccess');
    }, function (response) {
      $scope.responseError = 'Error submitting data: ' + response.statusText;
      $scope.responseErrorShow = true;
    });
  };

  $scope.loadPage = function(pName) {
    Restangular.one('sites', btappConfig.site).one('pages', pName).get().then(function (data) {
      $scope.page = data;
      if (data.htmlTitle && data.htmlTitle.length) {
        $rootScope.title = data.htmlTitle;
      }
      else {
        $rootScope.title = data.title;
      }

      if (data.includeForm && data.formId) {
        $scope.loadFormById(data.formId);
      }

      $rootScope.description = data.description;
      $scope.parents = $rootScope.pagetree.getParents($scope.page.name);
    });
  };

  $scope.loadPage($stateParams.pageName);

};
