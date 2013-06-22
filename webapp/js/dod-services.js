var app = angular.module('dod-services', []);

app.factory('geolocation', ['$window', function ($window) {
    return {
        getGeo: function (params) {
            var geo = { lat: 0, lon: 0 };

            // if (localStorage.lat) {
            //     geo.lat = localStorage.lat;
            //     geo.lon = localStorage.lon;
            // }

            if ($window.navigator.geolocation) {
                console.log('# geolocation available');
                $window.navigator.geolocation.getCurrentPosition(function (position) {
                    geo.lat = position.coords.latitude;
                    geo.lon = position.coords.longitude;

                    // localStorage.lat = geo.lat;
                    // localStorage.lon = geo.lon;

                    params.success(geo);
                });
            } else {
                console.log('# couldn\'t get geolocation');
            }
        }
    };
}]);

app.factory('moment', ['$window', function($window) {
    return $window.moment;
}]);

app.factory('serviceAPI', ['$http', 'geolocation', function ($http, geolocation) {
    var apiUrl = 'http://api.dev.stevenc81.com';

    var apis = {
        createCheckpoint: function(params) {
            var reqBody = {};

            if (params.lat && params.lon) {
                console.log('# reporting marked loc');
                reqBody['lat'] = params.lat.toString();
                reqBody['lon'] = params.lon.toString();
            } else {
                console.log('# reporting current loc');
                var geo = geolocation.getGeo();
                reqBody['lat'] = geo.lat;
                reqBody['lon'] = geo.lon;
            }

            var urlStr = apiUrl + '/checkpoints';

            $http({method: 'POST', url: urlStr, data: reqBody}).
            success(function (data, status, headers, config) {
                console.log(data);

                if (params && params.success) {
                    params.success(data);
                }
            }).
            error(function (data, status, headers, config) {
                console.log("# got some error");
            });
        },
        listCheckpoints: function(params) {
            var urlStr = apiUrl + '/checkpoints';

            var maxResults = params.maxResults? params.maxResults : 10,
            pageToken = params.pageToken? params.pageToken : 1;

            urlStr += '?maxResults=' + maxResults;
            urlStr += '&pageToken=' + pageToken;

            $http({method: 'GET', url: urlStr}).
            success(function (data, status, headers, config) {
                console.log(data);

                if (params && params.success) {
                    params.success(data);
                }
            }).
            error(function (data, status, headers, config) {
                console.log("# got some error");
            });
        }
    };

    return apis;
}]);
