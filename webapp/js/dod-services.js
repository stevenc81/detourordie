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

app.factory('serviceAPI', ['$http', 'geolocation', function ($http, geolocation) {
    var apiUrl = 'http://dod-api.jit.su';

    var apis = {
        createCheckpoint: function(params) {
            var geo = geolocation.getGeo();
            var urlStr = apiUrl + '/checkpoints';

            $http({method: 'POST', url: urlStr, data: {
                lat: geo.lat,
                lon: geo.lon
            }}).
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
