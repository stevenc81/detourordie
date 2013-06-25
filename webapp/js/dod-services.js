var app = angular.module('dod-services', []);

app.factory('geolocation', ['$window', function ($window) {
    return {
        getGeo: function (params) {
            var geo = { lat: 0, lon: 0 };

            if (localStorage.lat && localStorage.lon) {
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

                    params.success(geo);
                });
            } else {
                console.log('# couldn\'t get geolocation');
                params.error();
            }
        }
    };
}]);

app.factory('moment', ['$window', function($window) {
    return $window.moment;
}]);

app.factory('googleGeometry', ['$window', function($window) {
    return $window.google.maps.geometry;
}]);


app.factory('dialogBox', ['$window', function ($window) {
    var overlay;

    return {
        alert: function (message, callback) {
            alert(message);
            if(callback) callback();
        },
        confirm: function (message, callback) {
            var choice = $window.confirm(message);
            if (callback) callback(choice);
        },
        hideOverlay: function () {
            if (overlay) overlay.hide();
        },
        success: function (opt) {
            var option = opt ? opt : {};
            overlay = iosOverlay({
                text: option.text ? option.text : "好了!",
                duration: option.duration ? option.duration : 2e3,
                icon: "img/check.png"
            });
        },
        error: function (opt) {
            var option = opt ? opt : {};
            overlay = iosOverlay({
                text: option.text ? option.text : "失敗!",
                duration: option.duration ? option.duration : 2e3,
                icon: "img/cross.png"
            });
        },
        loading: function (opt) {
            var spinOpts = {
                lines: 13, // The number of lines to draw
                length: 11, // The length of each line
                width: 5, // The line thickness
                radius: 17, // The radius of the inner circle
                corners: 1, // Corner roundness (0..1)
                rotate: 0, // The rotation offset
                color: '#FFF', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false, // Whether to render a shadow
                hwaccel: false, // Whether to use hardware acceleration
                className: 'spinner', // The CSS class to assign to the spinner
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                top: 'auto', // Top position relative to parent in px
                left: 'auto' // Left position relative to parent in px
            };

            var target = document.createElement("div");
            document.body.appendChild(target);
            var spinner = new Spinner(spinOpts).spin(target);

            overlay = iosOverlay({
                text: "等一下",
                duration: 2e3,
                spinner: spinner,
                onhide: function () {
                    document.body.removeChild(target);
                }
            });
        }
    };
}]);

app.factory('serviceAPI', ['$http', 'geolocation', function ($http, geolocation) {
    var apiUrl = 'http://api.dev.stevenc81.com';

    var _httpReq = function(params, method, urlStr, data) {
        $http({method: method, url: urlStr, data: data}).
        success(function (data, status, headers, config) {
            console.log('# api return data: ' + data);

            if (params && params.success) {
                params.success(data);
            }
        }).
        error(function (data, status, headers, config) {
            console.log("# got error requesting API");
            params.error();
        });
    };

    var apis = {
        createCheckpoint: function(params) {
            var reqBody = {};
            var urlStr = apiUrl + '/checkpoints';

            console.log('# reporting loc');
            reqBody['lat'] = params.lat.toString();
            reqBody['lon'] = params.lon.toString();

            _httpReq(params, 'POST', urlStr, reqBody);
        },
        listCheckpoints: function(params) {
            var urlStr = apiUrl + '/checkpoints';

            var maxResults = params.maxResults? params.maxResults : 10,
            pageToken = params.pageToken? params.pageToken : 1;

            urlStr += '?maxResults=' + maxResults;
            urlStr += '&pageToken=' + pageToken;

            _httpReq(params, 'GET', urlStr, {});
        }
    };

    return apis;
}]);
