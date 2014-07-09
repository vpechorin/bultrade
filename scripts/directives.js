'use strict';

/* Directives */

angular.module('btapp.directives', []).
directive('appVersion', ['version', function (version) {
  return function (scope, elm, attrs) {
    elm.text(version);
  };
}]).directive('dynamic', function ($compile) {
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
}).directive('ngConfirmClick', [
  function(){
    return {
      priority: -1,
      restrict: 'A',
      link: function(scope, element, attrs){
        element.bind('click', function(e){
          var message = attrs.ngConfirmClick;
          if(message && !confirm(message)){
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        });
      }
    };
  }
]).directive('loadingWidget', function (requestNotification) {
  return {
    restrict: "AC",
    link: function (scope, element) {
      // hide the element initially
      element.hide();

      //subscribe to listen when a request starts
      requestNotification.subscribeOnRequestStarted(function () {
        // show the spinner!
        element.show();
      });

      requestNotification.subscribeOnRequestEnded(function () {
        // hide the spinner if there are no more pending requests
        if (requestNotification.getRequestCount() === 0) element.hide();
      });
    }
  };
}).directive('ktSubpages', ['Restangular','$stateParams', function(Restangular, $stateParams) {
  var checking = null;
  return {
    restrict: "AE",
    replace: true,
    templateUrl: 'partials/subpages.html',
    link: function(scope, element, attrs) {
       Restangular.one('sites', btappConfig.site).one('pages', $stateParams.pageName).getList("children").then(function (list) {
        scope.subpages = list;
      });
    }
  };
}]).directive('nxEqualEx', function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, model) {
      if (!attrs.nxEqualEx) {
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
