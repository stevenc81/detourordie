var app = angular.module('dod', ['google-maps', 'dod-services', 'ajoslin.mobile-navigate']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/main', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/report', {controller: ReportCtrl, templateUrl: 'report.html'}).
            when('/list', {controller: ListCtrl, templateUrl: 'list.html'}).
            when('/pin_map/:lat/:lon', {controller: PinMapCtrl, templateUrl: 'pin_map.html'}).
            otherwise({redirectTo: '/main'});
    });

app.run(function ($rootScope, $location) {
    // New look for Google Maps
    google.maps.visualRefresh = true;
});

function MainCtrl($scope, geolocation, $log, serviceAPI, $navigate, moment) {
    console.log('# in main control');

    var checkpoints = [];
    angular.extend($scope, {
        position: {
                  coords: {
                    latitude: 0,
                    longitude: 0
                  }
        },
        centerProperty: {
            latitude: 0,
            longitude: 0
        },

        zoomProperty: 13,

        markersProperty: checkpoints
    });

    geolocation.getGeo({
        success: function(geo) {
            angular.extend($scope, {
                position: {
                  coords: {
                    latitude: geo.lat,
                    longitude: geo.lon
                  }
                }
            });

            $scope.$apply();
        }
    });

    serviceAPI.listCheckpoints({
        'maxResults': 100,
        'pageToken': 1,
        success: function(data) {
            for (var i = 0; i < data.items.length; i++) {
                var formattedTime = moment(data.items[i].timestamp).
                                format('MM-DD hh:mm A');
                checkpoints.push({
                    latitude: data.items[i].lat,
                    longitude: data.items[i].lon,
                    infoWindow: 'Reported at: ' + formattedTime
                });
            }
        }
    });

    $scope.reportCurrentLoc = function() {
        console.log('# report current loc');
        serviceAPI.createCheckpoint({
            success: function(data) {
                checkpoints.push({
                    latitude: data.checkpoint.lat,
                    longitude: data.checkpoint.lon
                });
            }
        });
    };

    $scope.listView = function() {
        console.log('# list view');
        $navigate.go('/list');
    };

    $scope.report = function() {
        console.log('# report on map');
        $navigate.go('/report');
    };
}

function ReportCtrl($scope, geolocation, $navigate, $log, serviceAPI) {
    console.log('# in report ctrl');

    var checkpoints = [];
    var markedLoc = {};

    angular.extend($scope, {
        position: {
                  coords: {
                    latitude: 0,
                    longitude: 0
                  }
        },
        centerProperty: {
            latitude: 0,
            longitude: 0
        },

        zoomProperty: 13,

        markersProperty: checkpoints,

        eventsProperty: {
          click: function (mapModel, eventName, originalEventArgs) {
            markedLoc['lat'] = originalEventArgs[0].latLng.jb;
            markedLoc['lon'] = originalEventArgs[0].latLng.kb;
          }
        }
    });

    geolocation.getGeo({
        success: function(geo) {
            angular.extend($scope, {
                position: {
                  coords: {
                    latitude: geo.lat,
                    longitude: geo.lon
                  }
                }
            });

            $scope.$apply();
        }
    });

    $scope.back2Map = function() {
        console.log('# back to main');
        $navigate.go('/main');
    };

    $scope.saveReport = function() {
        console.log('# report selected loc');

        if (!markedLoc.lat || !markedLoc.lon) {
            alert('need to mark a loc');

            return;
        }

        console.log(markedLoc);

        serviceAPI.createCheckpoint({
            'lat': markedLoc.lat,
            'lon': markedLoc.lon,
            success: function(data) {
                checkpoints.push({
                    latitude: data.checkpoint.lat,
                    longitude: data.checkpoint.lon
                });

                $navigate.go('/main');
            }
        });
    };
}

function ListCtrl($scope, moment, serviceAPI, geolocation, $navigate, googleGeometry) {
    console.log('# in list ctrl');

    var currentGeo;

    var _prepareData = function(data) {
        console.log(moment().diff(data.timestamp, 'hours'));
        var rv = {
            'timestamp': data.timestamp,
            'ago': moment(data.timestamp).fromNow(),
            'age': moment().diff(data.timestamp, 'hours'),
            'distance': Math.round(googleGeometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(currentGeo.lat, currentGeo.lon),
                new google.maps.LatLng(data.lat, data.lon))),
            'lat': data.lat,
            'lon': data.lon
        };

        return rv;
    };

    geolocation.getGeo({
        success: function(geo) {
            currentGeo = geo;
            var checkpoints = [];

            serviceAPI.listCheckpoints({
                'maxResults': 100,
                'pageToken': 1,
                success: function(data) {
                    for (var i = 0; i < data.items.length; i++) {
                        checkpoints.push(_prepareData(data.items[i]));
                    }

                    $scope.checkpoints = checkpoints.sort(function(a, b) {
                        var rv = moment(b.timestamp).diff(moment(a.timestamp));
                        return rv;
                    });
                }
            });

        }
    });

    $scope.back2Map = function() {
        console.log('# back to main');

        $navigate.go('/main');
    };

    $scope.pinOnMap = function(checkpoint) {
        console.log('# pin on map');

        $navigate.go('/pin_map/' + checkpoint.lat + '/' + checkpoint.lon, 'slide');
    };
}

function PinMapCtrl($scope, $routeParams, $navigate) {
    console.log('# in pin map ctrl');

    var latitude = $routeParams.lat;
    var longitude = $routeParams.lon;

    angular.extend($scope, {
        position: {
                  coords: {
                    latitude: latitude,
                    longitude: longitude
                  }
        },
        centerProperty: {
            latitude: latitude,
            longitude: longitude
        },

        zoomProperty: 13,

        markersProperty: [{'latitude': latitude, 'longitude': longitude}]
    });

    $scope.back2List = function() {
        console.log('# back to list');

        $navigate.go('/list');
    };

}