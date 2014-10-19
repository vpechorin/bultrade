'use strict';

var btappConfig = require('../config');

module.exports = function ($rootScope, $scope, $state, $stateParams, Restangular) {

  $scope.sitetree = {};
  $scope.sitetree.pages = [];
  $scope.sitetree.pagemap = {};
  $scope.treedata = [];

  $scope.expandedNodes = [];

  $scope.treeOptions = {
    nodeChildren: 'nodes',
    dirSelectable: false,
    injectClasses: {
      ul: 'a1',
      li: 'a2',
      liSelected: 'a7',
      iExpanded: 'a3',
      iCollapsed: 'a4',
      iLeaf: 'a5',
      label: 'a6',
      labelSelected: 'a8'
    }
  };

  var branchProcess = function(node) {
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
    return filesFound;
  };

  var treeProcess = function() {
    var nodes = $scope.treedata;

    if (typeof nodes === undefined || nodes.length === 0) {
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

  $scope.makeFileUrl = function(f) {
    return btappConfig.attPath + '/' + $rootScope.site.id + f.directoryPath + '/' + f.name;
  };

  Restangular.one('sites', btappConfig.site).getList('tree', {files: 'true'}).then(function (data) {
    $scope.treedata = data.plain();
    treeProcess();
  });

};
