'use strict';

//require('es5-shim');
//require('es5-sham');

require('jquery');
var angular = require('angular');
require('angular-ui-router');
require('lodash');
require('restangular');
require('angular-bootstrap');
require('angular-tree-control');
require('angular-touch');
require('textAngularSanitize');
require('textAngular');
require('angular-formly');
require('angular-loading-bar');

var app = angular.module('btapp', ['ng', 'ui.router', 'ngTouch', 'ui.bootstrap', 'restangular', 'treeControl', 'textAngular', 'formly', 'angular-loading-bar' ]);

var btappConfig = require('./config');
require('./filters');
require('./controllers');
require('./directives');

app.config( function ( $stateProvider,
                        $urlRouterProvider,
                        $locationProvider,
                        RestangularProvider) {

  $locationProvider.html5Mode(btappConfig.html5Mode).hashPrefix('!');

  RestangularProvider.setBaseUrl('/api/browse');

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: '/partials/home.html',
    controller: 'HomeController'
  })
  .state('sitemap', {
    url: '/pvs/sitemap',
    templateUrl: '/partials/sitemap.html'
  })
  .state('downloads', {
    url: '/pvs/downloads',
    templateUrl: '/partials/downloads.html',
    controller: 'DownloadsController'
  })
  .state('customforms', {
    url: '/pvs/forms/{formName}',
    templateUrl: '/partials/customform.html',
    controller: 'FormController'
  })
  .state('customformsuccess', {
    url: '/pvs/formresult/success',
    templateUrl: '/partials/customformsuccess.html',
    controller: 'FormSuccessController'
  })
  .state('pageview', {
    url: '/pv/{pageName}',
    templateUrl: '/partials/page.html',
    controller: 'PageViewController'
  });

});

app.run( function ($rootScope, $state, $stateParams, Restangular) {

  $rootScope.site = {};
  $rootScope.pagetree = {};
  $rootScope.pagetree.pages = [];
  $rootScope.pagetree.pagemap = {};

  var branchProcess = function(node) {
    $rootScope.pagetree.pagemap[node.name] = node;
    if (typeof node.nodes !== undefined) {
      var children = node.nodes;
      var i = 0;
      for (i = 0; i < children.length; i++) {
        var child = children[i];
        child.parent = node;
        branchProcess(child);
      }
    }
  };

  var treeProcess = function(tree) {
    if (typeof tree !== undefined) {
      var i = 0;
      for (i = 0; i < tree.length; i++) {
        var rootNode = tree[i];
        rootNode.parent = null;
        branchProcess(rootNode);
      }
    }
  };

  $rootScope.pagetree.findPage = function(pageName) {
    var p = $rootScope.pagetree.pagemap[pageName];
    return p;
  };

  $rootScope.pagetree.getParents = function(pageName) {
    var p = $rootScope.pagetree.pagemap[pageName];
    var list = [];
    list[0] = p;
    var c = p;
    while (c.parent !== null) {
      list.unshift(c.parent);
      c = c.parent;
    }
    return list;
  };

  Restangular.one('sites', btappConfig.site).get().then(function (data) {
    $rootScope.site = data.plain();
  });

  Restangular.one('sites', btappConfig.site).all('tree').getList().then(function (data) {
    $rootScope.pagetree.pages = data.plain();
    treeProcess($rootScope.pagetree.pages);
  });

  /* Reset error when a new view is loaded */
  $rootScope.$on('$viewContentLoaded', function () {
    delete $rootScope.error;
  });

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.initialized = true;
});
