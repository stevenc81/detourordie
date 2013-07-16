var myApp = angular.module('dod-directives', []);

myApp.directive('ngTap', function() {
    var isTouchDevice = !!("ontouchstart" in window);
    return function(scope, elm, attrs) {
        if (isTouchDevice) {
            var tapping = false;
            elm.bind('touchstart', function() { tapping = true; });
            elm.bind('touchmove', function() { tapping = false; });
            elm.bind('touchend', function() {
                console.log('[ngTap] ' + attrs.ngTap);
                if (tapping) {
                    scope.$apply(attrs.ngTap);
                }
            });
        } else {
            elm.bind('click', function() {
                console.log('[ngTap] ' + attrs.ngTap);
                scope.$apply(attrs.ngTap);
            });
        }
    };
});
