(function (angular) {
'use strict';
var link = function($scope, $element, $attributes, ngModel, $compile, $parse){
    var options = {};
    options.format = $attributes.format || 'YYYY-MM-DD';
    options.separator = $attributes.separator || ' - ';
    options.minDate = $attributes.minDate && moment($attributes.minDate);
    options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
    options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function (elem, index) { return index === 0 && parseInt(elem, 10) || elem; }) );
    options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
    options.locale = $attributes.locale && $parse($attributes.locale)($scope);
    options.opens = $attributes.opens || 'right';

    function format(date) {
        return date.format(options.format);
    }

    function formatted(dates) {
        return [format(dates.startDate), format(dates.endDate)].join(options.separator);
    }

    ngModel.$formatters.unshift(function (modelValue) {
        if (!modelValue) return '';
        return modelValue;
    });

    ngModel.$parsers.unshift(function (viewValue) {
        return viewValue;
    });

    ngModel.$render = function () {
        if (!ngModel.$viewValue || !ngModel.$viewValue.startDate) {
            $element.val('');
        }else {
            $element.val(formatted(ngModel.$viewValue));
        }

    };

    $scope.$watch(function(){
           return ngModel.$modelValue;
        }, function (modelValue) {
            if (!modelValue || (!modelValue.startDate)) {
                ngModel.$setViewValue(null);
                ngModel.$render();
                return;
            }
            $element.data('daterangepicker').setStartDate(modelValue.startDate);
            $element.data('daterangepicker').setEndDate(modelValue.endDate);
            $element.data('daterangepicker').updateView();
            $element.data('daterangepicker').updateCalendars();
            $element.data('daterangepicker').updateInputText();
            ngModel.$setViewValue(modelValue);
            ngModel.$render();
    });

    $element.daterangepicker(options);

    $element.on('apply.daterangepicker', function(ev, picker) {
        $scope.$apply(function () {
            ngModel.$setViewValue({ startDate: picker.startDate, endDate: picker.endDate});
            ngModel.$render();
        });
    });

};
angular.module('bootstrap.dateRangePicker', [])
    .directive('daterange',['$compile', '$parse', function ($compile, $parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
              ngChange: "&"
            },
            link: function ($scope, $element, $attributes, ngModel) {
                link($scope, $element, $attributes, ngModel, $compile, $parse);
            }
        };
    }]).directive('input',['$compile', '$parse', function ($compile, $parse) {
        return{
            restrict: 'E',
            require: '?ngModel',
            scope: {
              ngChange: "&"
            },
            link: function($scope, $element, $attributes, ngModel){
                if ($attributes.type !== 'daterange') return;
                link($scope, $element, $attributes, ngModel, $compile, $parse);
            }
        };
    }]);
})(angular);
