var app = angular.module('dod-services', []);

app.factory('geolocation', ['$window', function ($window) {
    return {
        getGeo: function () {
            var geo = { lat: 0, lon: 0 };

            if (localStorage.lat) {
                geo.lat = localStorage.lat;
                geo.lon = localStorage.lon;
            }

            if ($window.navigator.geolocation) {
                console.log('# geolocation available');
                $window.navigator.geolocation.getCurrentPosition(function (position) {
                    geo.lat = position.coords.latitude;
                    geo.lon = position.coords.longitude;

                    localStorage.lat = geo.lat;
                    localStorage.lon = geo.lon;
                });
            }

            return geo;
        }
    };
}]);

app.factory('serviceAPI', ['$http', '$rootScope', '$location', 'geolocation', 'socketIO', 'chatStorage', 'dialogBox', '$navigate', function ($http, $rootScope, $location, geolocation, socketIO, chatStorage, dialogBox, $navigate) {
    var ServiceAPIs = {
            'p': 'http://api.2or3.com',
            'd': 'http://dev.api.2or3.com'},
        apiMode = localStorage.apiMode ? localStorage.apiMode : 'p',
        apiPrefix = ServiceAPIs[apiMode];
        console.log('[serviceAPI][mode] ' + apiMode);

    var _appendAuth = function (urlStr) {
        urlStr += '&uid=' + localStorage.uid;
        urlStr += '&token=' + localStorage.token;

        if (urlStr.indexOf('?') === -1) {
            urlStr = urlStr.replace('&uid', '?uid');
        }

        return urlStr;
    };
