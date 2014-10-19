'use strict';

var btappConfig = require('../config');

var app = require('angular').module('btapp');

app.directive('appVersion', function (version) {
  return function (scope, elm, attrs) {
    elm.text(version);
  };
});

app.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function postLink(scope, element, attrs) {
      scope.$watch( attrs.dynamic , function(html){
        element.html(html);
        $compile(element.contents())(scope);
      });
    }
  };
});

app.directive('ktSubpages', function(Restangular, $stateParams) {
  var checking = null;
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: '/partials/subpages.html',
    link: function(scope, element, attrs) {
       Restangular.one('sites', btappConfig.site).one('pages', $stateParams.pageName).getList('children').then(function (list) {
        scope.subpages = list;
      });
    }
  };
});

app.directive('nxEqualEx', function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, model) {
      if (!attrs.nxEqualEx) {
        // console.error('nxEqualEx expects a model as an argument!');
        return;
      }
      scope.$watch(attrs.nxEqualEx, function (value) {
        // Only compare values if the second ctrl has a value.
        if (model.$viewValue !== undefined && model.$viewValue !== '') {
          model.$setValidity('nxEqualEx', value === model.$viewValue);
        }
      });
      model.$parsers.push(function (value) {
        // Mute the nxEqual error if the second ctrl is empty.
        if (value === undefined || value === '') {
          model.$setValidity('nxEqualEx', true);
          return value;
        }
        var isValid = value === scope.$eval(attrs.nxEqualEx);
        model.$setValidity('nxEqualEx', isValid);
        return isValid ? value : undefined;
      });
    }
  };
});
