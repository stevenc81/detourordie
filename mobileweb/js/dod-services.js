var app = angular.module('dod-services', []);

app.factory('Facebook', ['$rootScope', function ($rootScope) {

    var self = this;
    this.auth = null;

    return {
        getAuth: function () {
            return self.auth;
        },
        getLoginStatus: function (next) {
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    // connected
                    console.log('# FB user authenticated already');
                    console.log(response);
                    self.auth = response.authResponse;

                    next();
                } else if (response.status === 'not_authorized') {
                    // not_authorized
                    console.log('# not_authorized');
                } else {
                    // not_logged_in
                    console.log('# not_logged_in');
                }
            });
        },
        login: function (params) {
            console.log('# Logging to FB from service');
            FB.login(function(response) {
                if (response.authResponse) {
                    console.log('# [Facebook] logged in');
                    console.log(response);
                    self.auth = response.authResponse;

                    params.success(self.auth);
                } else {
                    console.log('Facebook login failed', response);

                    params.error();
                }
            });
        },
        logout: function () {
            console.log('# logout');
            FB.logout(function(response) {
                if (response) {
                    self.auth = null;
                } else {
                    console.log('Facebook logout failed.', response);
                }
            });
        }
    };
}]);

app.factory('geolocation', ['$window', function ($window) {
    return {
        getGeo: function (params) {
            var geo = { lat: 0, lon: 0 };

            if ($window.navigator.geolocation) {
                console.log('# geolocation available from browser');

                $window.navigator.geolocation.getCurrentPosition(
                    function (position) {
                        localStorage.lat = geo.lat = position.coords.latitude;
                        localStorage.lon = geo.lon = position.coords.longitude;

                        console.log('# geolocation retrieved from browser, lat: %s lon: %s', geo.lat, geo.lon);

                        params.success(geo);
                    },
                    function(err) {
                        console.log('# geolocation retrieval incur an error: ' + err.message);

                        if (localStorage.lat && localStorage.lon) {
                            console.log('# geolocation available from localStorage');
                            geo.lat = localStorage.lat;
                            geo.lon = localStorage.lon;

                            params.success(geo);
                        } else {
                            params.error();
                        }
                    },
                    {maximumAge: 60000, timeout: 4000, enableHighAccuracy: true});
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

app.factory('googleGeocoder', ['$window', function($window) {
    return {
        getAddress: function (params) {
            new $window.google.maps.Geocoder().geocode(
            { 'latLng': new google.maps.LatLng(params.lat, params.lon) },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  if (results[1]) {
                    params.success(results[1].formatted_address);
                  } else {
                    console.log('No results found');
                    params.error();
                  }
                } else {
                    console.log('# Geocoder failed due to: ' + status);
                    params.error();
                }
            });
        }
    };
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

app.factory('serviceAPI', ['$http', 'googleGeocoder', function ($http, googleGeocoder) {
    var apiUrl = 'http://api.safejj.com';

    var _httpReq = function(params, method, urlStr, data) {
        $http({method: method, url: urlStr, data: JSON.stringify(data)}).
        success(function (data, status, headers, config) {
            console.log('# api return data: ');
            console.log(data);

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
        createAccount: function(params) {
            console.log('# calling api to create a new account');
            var urlStr = apiUrl + '/users';

            _httpReq(params,'POST', urlStr, {
                'access_token': params.access_token
            });
        },
        createCheckpoint: function(params) {
            console.log('# calling api to create a checkpoint');
            var reqBody = {};
            var urlStr = apiUrl + '/checkpoints';

            console.log('# reporting loc');
            reqBody['lat'] = params.lat;
            reqBody['lon'] = params.lon;

            googleGeocoder.getAddress({
                'lat': params.lat,
                'lon': params.lon,
                success: function(address) {
                    reqBody['address'] = address;
                    _httpReq(params, 'POST', urlStr, reqBody);
                },
                error: function() {
                  _httpReq(params, 'POST', urlStr, reqBody);
                }
            });
        },
        listCheckpoints: function(params) {
            console.log('# calling api for a list of checkpoints');
            var urlStr = apiUrl + '/checkpoints';

            var maxResults = params.maxResults? params.maxResults : 10,
            pageToken = params.pageToken? params.pageToken : 1;

            urlStr += '?maxResults=' + maxResults;
            urlStr += '&pageToken=' + pageToken;

            _httpReq(params, 'GET', urlStr, {});
        },
        getActivity: function(params) {
            console.log('# calling api for an activity');
            var urlStr = apiUrl + '/activities';

            urlStr += '/' + params.id;

            _httpReq(params, 'GET', urlStr, {});
        }
    };

    return apis;
}]);

app.factory('socketIO', ['$window', '$rootScope', function ($window, $rootScope) {
    var socketURL = 'http://asms.safejj.com:9002/checkpoints';

    $window.socket = $window.io.connect(socketURL, {
        'reconnection delay': 100, // defaults to 500
        'reconnection limit': 100, // defaults to Infinity
        'max reconnection attempts': Infinity // defaults to 10
    });

    $window.socket.on('connecting', function () {
        console.log('# connecting to socket server');
    });

    $window.socket.on('connect', function () {
        console.log('# successfully connected to socket server');
    });

    $window.socket.on('reconnecting', function () {
        console.log('# reconnecting to socket server');
    });

    $window.socket.on('reconnect', function () {
        console.log('# successfully re-connected to socket server');
    });

    $window.socket.on('connect_failed', function () {
        console.log('# failed to connect to socket server');
    });

    $window.socket.on('reconnect_failed', function () {
        console.log('# failed to re-connect to socket server');
    });

    $window.socket.on('error', function () {
        console.log('# error when connecting to socket server');
    });

    return {
        on: function(eventName, callback) {
            $window.socket.on(eventName, function(data) {
                console.log('# got new checkpoint from socket');
                $rootScope.$apply(function() {
                    if (callback) {
                        callback(data);
                    }
                });
            });
        }
    };
}]);
