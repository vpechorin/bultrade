'use strict';

// Declare app level module which depends on filters, and services
angular.module('btapp', [
    'ui.router',
    'ngTouch',
    'ui.bootstrap',
    'restangular',
    'treeControl',
    'btapp.filters',
    'btapp.directives',
    'btapp.services',
    'btapp.controllers'
]).
  config(['$stateProvider',
          '$urlRouterProvider',
          '$httpProvider',
          '$locationProvider',
          'RestangularProvider',
          'requestNotificationProvider',
          function ( $stateProvider,
                     $urlRouterProvider,
                     $httpProvider,
                     $locationProvider,
                     $restangularProvider,
                     requestNotificationProvider) {
            console.log("Config started");

            $locationProvider.html5Mode(false);

            $restangularProvider.setBaseUrl('/api/browse');

            $urlRouterProvider.otherwise("/");

            console.log("Configure states");

            $stateProvider
            .state('home', {
              url: '/',
              templateUrl: 'partials/home.html',
              controller: 'HomeController'
            })
            .state('sitemap', {
              url: '/sitemap',
              templateUrl: 'partials/sitemap.html'
            })
            .state('downloads', {
              url: '/downloads',
              templateUrl: 'partials/downloads.html',
              controller: 'DownloadsController'
            })
            .state('pageview', {
              url: '/pv/:pageName',
              templateUrl: 'partials/page.html',
              controller: 'PageViewController'
            });

            console.log("Configure http req interceptors");

            $httpProvider.defaults.transformRequest.push(function (data) {
              requestNotificationProvider.fireRequestStarted(data);
              console.log("Request started");
              return data;
            });

            $httpProvider.defaults.transformResponse.push(function (data) {
              requestNotificationProvider.fireRequestEnded(data);
              console.log("Request ended");
              return data;
            });

            console.log("Config ended");
          }])
.run([ '$rootScope', '$state', '$stateParams', 'Restangular',
      function ($rootScope, $state, $stateParams, Restangular) {

        console.log("Initialize rootScope");
        $rootScope.site = {};
        $rootScope.pagetree = {};
        $rootScope.pagetree.pages = [];
        $rootScope.pagetree.pagemap = {};

        Restangular.one('sites', btappConfig.site).get().then(function (data) {
          $rootScope.site = data.plain();
        });

        Restangular.one('sites', btappConfig.site).all('tree').getList().then(function (data) {
          $rootScope.pagetree.pages = data.plain();
          treeProcess($rootScope.pagetree.pages);
        });

        var treeProcess = function(tree) {
          if (tree != null) {
            var i = 0;
            for (i = 0; i < tree.length; i++) {
              var rootNode = tree[i];
              rootNode.parent = null;
              branchProcess(rootNode);
            }
          }
        };

        var branchProcess = function(node) {
          $rootScope.pagetree.pagemap[node.name] = node;
          if (node.nodes != null) {
            var children = node.nodes;
            var i = 0;
            for (i = 0; i < children.length; i++) {
              var child = children[i];
              child.parent=node;
              branchProcess(child);
            }
          }
        };

        $rootScope.pagetree.findPage = function(pageName) {
          var p = $rootScope.pagetree.pagemap[pageName];
          if (p == null) console.log("Page not found: " + pageName);
          return p;
        };

        $rootScope.pagetree.getParents = function(pageName) {
          var p = $rootScope.pagetree.pagemap[pageName];
          var list = [];
          list[0] = p;
          var c = p;
          while (c.parent != null) {
            list.unshift(c.parent);
            c = c.parent;
          }
          return list;
        };

        /* Reset error when a new view is loaded */
        $rootScope.$on('$viewContentLoaded', function () {
          delete $rootScope.error;
        });

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.initialized = true;
      }]);

