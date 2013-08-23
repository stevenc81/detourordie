var app = angular.module('dod', ['google-maps', 'dod-services', 'dod-directives', 'ajoslin.mobile-navigate']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/main', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/login', {controller: LoginCtrl, templateUrl: 'login.html'}).
            when('/report', {controller: ReportCtrl, templateUrl: 'report.html'}).
            when('/list', {controller: ListCtrl, templateUrl: 'list.html'}).
            when('/pin_map/:lat/:lon/:c_time', {controller: PinMapCtrl, templateUrl: 'pin_map.html'}).
            otherwise({redirectTo: '/'});
    })
    .run(function ($route, $http, $templateCache) {
         angular.forEach($route.routes, function(r) {
            if (r.templateUrl) {
              $http.get(r.templateUrl, {cache: $templateCache});
            }
        });
        // New look for Google Maps
        google.maps.visualRefresh = true;
        moment.lang('zh-tw');
    });

function LoginCtrl($scope, Facebook, $navigate, dialogBox, serviceAPI) {
    console.log('# in login ctrl');

    setTimeout(function () {
        Facebook.getLoginStatus(function() {
            console.log($navigate);
            $navigate.go('/main', 'slide');
            if(!$scope.$$phase) $scope.$apply();
        });
    }, 1000);

    $scope.loginFB = function() {
        console.log('# logging in to FB');
        Facebook.login({
            success: function(data) {
                serviceAPI.createAccount({
                    'access_token': data.accessToken,
                    success: function() {
                        $navigate.go('/main', 'slide');
                    },
                    error: function() {
                        console.log('# Create account failed');
                        dialogBox.error();
                    }
                });
            },
            error: function() {
                console.log('# FB login failed');
                dialogBox.error();
            }
        });
    };
}

function MainCtrl($scope, geolocation, $log, serviceAPI, $navigate, moment, dialogBox, socketIO, googleGeocoder, $timeout) {
    console.log('# in main control');

    var checkpoints = [];
    angular.extend($scope, {
        centerProperty: {
            latitude: 0,
            longitude: 0
        },
        zoomProperty: 13,

        markersProperty: checkpoints
    });

    geolocation.getGeo({
        success: function(geo) {
            $scope.centerProperty = {
                            latitude: 121,
                            longitude: 25
                        };
            $scope.$apply();

            $timeout(function () {
                $scope.centerProperty = {
                            latitude: geo.lat,
                            longitude: geo.lon
                        };
            }, 1000);
        },
        error: function() {
            dialogBox.error({
                'text': 'GPS定位不了！'
            });
        }
    });

    serviceAPI.getActivity({
        'id': 'latest',
        success: function(latest) {
            $scope.notif_address = latest.address;
        },
        error: function() {
            console.log('# could not get latest checkpoint from api');
        }
    });

    socketIO.on('checkpoints', function(data) {
        console.log('# new checkpoint broadcasted to scope');
        var parsed = JSON.parse(data);
        googleGeocoder.getAddress({
            'lat': parsed.lat,
            'lon': parsed.lon,
            success: function(address) {
                $scope.$apply(function() {
                    $scope.notif_address = address;
                });
            },
            error: function() {
                console.log('# could not load address');
            }
        });
    });

    dialogBox.loading();
    serviceAPI.listCheckpoints({
        'maxResults': 100,
        'pageToken': 1,
        success: function(data) {
            for (var i = 0; i < data.items.length; i++) {
                checkpoints.push({
                    latitude: data.items[i].lat,
                    longitude: data.items[i].lon,
                    infoWindow: moment(data.items[i].timestamp).fromNow()
                });
            }

            dialogBox.hideOverlay();
        },
        error: function() {
            dialogBox.error();
            dialogBox.hideOverlay();
        }
    });

    $scope.reportCurrentLoc = function() {
        console.log('# report current loc');

        var _reportHere = function(sayYes) {
            if (sayYes) {
                geolocation.getGeo({
                    success: function(geo) {
                        dialogBox.loading();
                        serviceAPI.createCheckpoint({
                            'lat': geo.lat,
                            'lon': geo.lon,
                            success: function(data) {
                                checkpoints.push({
                                    latitude: data.checkpoint.lat,
                                    longitude: data.checkpoint.lon
                                });

                                dialogBox.success();
                                dialogBox.hideOverlay();
                            },
                            error: function() {
                                dialogBox.error();
                                dialogBox.hideOverlay();
                            }
                        });
                    },
                    error: function() {
                        dialogBox.error();
                        dialogBox.hideOverlay();
                    }
                });
            }
        };

        dialogBox.confirm('現在的位置有臨檢？', _reportHere);
    };

    $scope.listView = function() {
        console.log('# list view');
        $navigate.go('/list', 'slide');
    };

    $scope.report = function() {
        console.log('# report on map');
        $navigate.go('/report', 'slide');
    };
}

function ReportCtrl($scope, geolocation, $navigate, $log, serviceAPI, dialogBox, $timeout) {
    console.log('# in report ctrl');

    var markedLoc = {};

    angular.extend($scope, {
        centerProperty: {
            latitude: 0,
            longitude: 0
        },

        zoomProperty: 13,
        markersProperty: [],
        eventsProperty: {
          click: function (mapModel, eventName, originalEventArgs) {
            markedLoc['lat'] = originalEventArgs[0].latLng.mb;
            markedLoc['lon'] = originalEventArgs[0].latLng.nb;
          }
        }
    });

    geolocation.getGeo({
        success: function(geo) {
            $scope.centerProperty = {
                            latitude: 121,
                            longitude: 25
                        };
            $scope.$apply();

            $timeout(function () {
                $scope.centerProperty = {
                            latitude: geo.lat,
                            longitude: geo.lon
                        };
            }, 1000);
        },
        error: function() {
            dialogBox.error({
                'text': 'GPS定位不了！'
            });
        }
    });

    $scope.back2Map = function() {
        console.log('# back to main');
        $navigate.back();
    };

    $scope.saveReport = function() {
        console.log('# report selected loc');

        if (!markedLoc.lat || !markedLoc.lon) {
            dialogBox.alert('必需標出一個地點');

            return;
        }

        dialogBox.loading();
        serviceAPI.createCheckpoint({
            'lat': markedLoc.lat,
            'lon': markedLoc.lon,
            success: function(data) {
                dialogBox.success();
                dialogBox.hideOverlay();
                $navigate.go('/main', 'slide');
            },
            error: function() {
                dialogBox.error();
                dialogBox.hideOverlay();
            }
        });
    };
}

function ListCtrl($scope, moment, serviceAPI, geolocation, $navigate, googleGeometry, dialogBox, googleGeocoder) {
    console.log('# in list ctrl');

    var currentGeo;

    var _prepareData = function(element) {

        return {'timestamp': element.timestamp,
        'ago': moment(element.timestamp).fromNow(),
        'age': moment().diff(element.timestamp, 'hours'),
        'distance': Math.round(googleGeometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(currentGeo.lat, currentGeo.lon),
                    new google.maps.LatLng(element.lat, element.lon))),
        'lat': element.lat,
        'lon': element.lon,
        'address': element.address
        };
    };

    dialogBox.loading();
    geolocation.getGeo({
        success: function(geo) {
            currentGeo = geo;
            $scope.checkpoints = [];

            serviceAPI.listCheckpoints({
                'maxResults': 100,
                'pageToken': 1,
                success: function(data) {
                    data.items.forEach(function(element, index, array) {
                        $scope.checkpoints.push(_prepareData(element));
                    });

                    $scope.checkpoints = $scope.checkpoints.sort(function(a, b) {
                        var rv = moment(b.timestamp).diff(moment(a.timestamp));
                        return rv;
                    });

                    console.log('# checkpoint sorting completed');

                    dialogBox.hideOverlay();
                },
                error: function() {
                    dialogBox.error();
                    dialogBox.hideOverlay();
                }
            });
        },
        error: function() {
            dialogBox.error();
            dialogBox.hideOverlay();
        }
    });

    $scope.back2Map = function() {
        console.log('# back to main');

        $navigate.back();
    };

    $scope.pinOnMap = function(checkpoint) {
        console.log('# pin on map', 'slide');

        $navigate.go('/pin_map/' + checkpoint.lat + '/' + checkpoint.lon + '/' + checkpoint.timestamp, 'slide');
    };
}

function PinMapCtrl($scope, $routeParams, $navigate, moment, $timeout) {
    console.log('# in pin map ctrl');

    var latitude = $routeParams.lat;
    var longitude = $routeParams.lon;
    var c_time = $routeParams.c_time;

    angular.extend($scope, {
        centerProperty: {
            latitude: 0,
            longitude: 0
        },

        zoomProperty: 13,

        markersProperty: [{
            'latitude': latitude,
            'longitude': longitude,
            'infoWindow': moment(c_time).fromNow()}]
    });

    $timeout(function() {
        $scope.centerProperty = {
                            latitude: latitude,
                            longitude: longitude
                        };
    }, 1000);

    $timeout(function() {
        $scope.centerProperty = {
                            latitude: latitude,
                            longitude: longitude
                        };
    }, 2000);

    $scope.back2List = function() {
        console.log('# back to list');
        $navigate.back();
    };

}