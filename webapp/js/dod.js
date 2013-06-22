var app = angular.module('dod', ['google-maps', 'dod-services', 'ajoslin.mobile-navigate']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/main', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/report', {controller: ReportCtrl, templateUrl: 'report.html'}).
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

        zoomProperty: 16,

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
                var adjustedTime = moment(data.items[i].timestamp._d).
                                format('MM-DD HH:mm');
                checkpoints.push({
                    latitude: data.items[i].lat,
                    longitude: data.items[i].lon,
                    infoWindow: 'Reported at: ' + adjustedTime
                });
            }

            $scope.refreshProperty = true;
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

                $scope.refreshProperty = true;
            }
        });
    };

    $scope.refreshMap = function() {
        console.log('# refresh map');

        $scope.refreshProperty = true;
    };

    $scope.report = function() {
        console.log('# report on map');
        $navigate.go('/report');
    };
}

function ReportCtrl($scope, geolocation, $navigate, $log, serviceAPI) {
    console.log('# in report ctrl');

    var checkpoints = [];
    var geo = geolocation.getGeo();
    google.maps.visualRefresh = true;

    var markedLoc = {};

    angular.extend($scope, {

        position: {
          coords: {
            latitude: geo.lat,
            longitude: geo.lon
          }
        },

        /** the initial center of the map */
        centerProperty: {
            latitude: geo.lat,
            longitude: geo.lon
        },

        /** the initial zoom level of the map */
        zoomProperty: 14,

        /** list of markers to put in the map */
        markersProperty: [],

        // These 2 properties will be set when clicking on the map
        clickedLatitudeProperty: null,
        clickedLongitudeProperty: null,

        eventsProperty: {
          click: function (mapModel, eventName, originalEventArgs) {
            markedLoc['lat'] = originalEventArgs[0].latLng.jb;
            markedLoc['lon'] = originalEventArgs[0].latLng.kb;
          }
        }
    });

    $scope.back2Map = function() {
        $navigate.go('/main');
    };

    $scope.saveReport = function() {
        console.log('# report selected loc');

        if (!markedLoc.lat || !markedLoc.lon) {
            alert('need to mark a loc');

            return;
        }

        serviceAPI.createCheckpoint({
            'lat': markedLoc.lat,
            'lon': markedLoc.lon,
            success: function(data) {
                checkpoints.push({
                    latitude: data.checkpoint.lat,
                    longitude: data.checkpoint.lon
                });
                $scope.refreshProperty = true;

                $navigate.go('/main');
            }
        });
    };

}