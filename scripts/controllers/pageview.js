'use strict';
var btappConfig = require('../config');

module.exports = function ($scope, $state, $stateParams, $rootScope, Restangular) {
  $scope.page = {};
  $scope.subpages = [];

  Restangular.one('sites', btappConfig.site).one('pages', $stateParams.pageName).get().then(function (data) {
    $scope.page = data;
    if (data.htmlTitle && data.htmlTitle.length) {
      $rootScope.title = data.htmlTitle;
    }
    else {
      $rootScope.title = data.title;
    }

    $rootScope.description = data.description;
    $scope.parents = $rootScope.pagetree.getParents($scope.page.name);
  });

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + '/' + $scope.page.siteId + f.directoryPath + '/' + f.name;
  };

  $scope.getImageHeight = function(im, maxHeight) {
    return (im.height > maxHeight) ? maxHeight : im.height;
  };
};
