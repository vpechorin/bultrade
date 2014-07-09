'use strict';

/* Controllers */

angular.module('btapp.controllers', [])
.controller('HomeController', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', function ($rootScope, $scope, $state, $stateParams, Restangular) {
  $scope.page = {};

  Restangular.one('sites', btappConfig.site).one('pages', 'home').get().then(function (data) {
    $scope.page = data;
    $rootScope.title = data.title;
    $rootScope.description = data.description;
  });

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + f.directoryPath + '/' + f.name;
  };
  $scope.getImageHeight = function(im, maxHeight) {
    return (im.height > maxHeight) ? maxHeight : im.height;
  };

}]).controller('PageViewController', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', function ($rootScope, $scope, $state, $stateParams, Restangular) {
  $scope.page = {};
  $scope.subpages = [];

  Restangular.one('sites', btappConfig.site).one('pages', $stateParams.pageName).get().then(function (data) {
    $scope.page = data;
    $rootScope.title = data.title;
    $rootScope.description = data.description;
    $scope.parents = $rootScope.pagetree.getParents($scope.page.name);
  });

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + f.directoryPath + '/' + f.name;
  };

  $scope.getImageHeight = function(im, maxHeight) {
    return (im.height > maxHeight) ? maxHeight : im.height;
  };

}]).controller('DownloadsController', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', function ($rootScope, $scope, $state, $stateParams, Restangular) {
  $scope.sitetree = {};
  $scope.sitetree.pages = [];
  $scope.sitetree.pagemap = {};
  $scope.treedata = [];

  Restangular.one('sites', btappConfig.site).getList("tree", {files: 'true'}).then(function (data) {

    $scope.treedata = data.plain();
    treeProcess();
  });

  $scope.expandedNodes = [];

  var treeProcess = function() {
    var nodes = $scope.treedata;

    if (nodes == null || nodes.length == 0) {
      console.log("No nodes found");
      return;
    }
    var filtered = [];
    for (var j = 0; j < nodes.length; j++) {
      var filesFound = branchProcess(nodes[j]);
      if (filesFound > 0) {
        filtered.push(nodes[j]);
      }
    }
    var level1Nodes = [];

    for(var l = 0; l < filtered.length; l++) {
      for(var i = 0; i < filtered[l].nodes.length; i++) {
        var rootNode = filtered[l].nodes[i];
        level1Nodes.push(rootNode);
        $scope.expandedNodes.push(rootNode);
      }
    }

    $scope.treedata = level1Nodes;
  };

  var branchProcess = function(node) {
    console.log("Processing node: " + node.id + "/" + node.name + " ** " + node.nodes);
    var nodes = node.nodes;
    var filesFound = 0;

    var filtered = [];
    node.isFile = false;

    if (node.files.length > 0) {

      for(var k = 0; k < node.files.length; k++) {
        var f = node.files[k];
        f.nodes = [];
        f.files = [];
        f.isFile = true;
        filtered.push(f);
        filesFound++;
        console.log("File found: " + f.name);
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var child = nodes[i];
      var branchFilesFound = branchProcess(child);
      if (branchFilesFound > 0) {
        filtered.push(child);
        filesFound += branchFilesFound;
      }
    }
    node.nodes = filtered;
    node.filesNum = filesFound;
    console.log("Node: " + node.name + " files: " + filesFound);
    return filesFound;
  };

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + f.directoryPath + '/' + f.name;
  };

  $scope.treeOptions = {
    nodeChildren: "nodes",
    dirSelectable: false,
    injectClasses: {
        ul: "a1",
        li: "a2",
        liSelected: "a7",
        iExpanded: "a3",
        iCollapsed: "a4",
        iLeaf: "a5",
        label: "a6",
        labelSelected: "a8"
    }
  }


}]);

