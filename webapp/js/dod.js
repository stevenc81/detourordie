var app = angular.module('dod', ['google-maps', 'dod-services', 'ajoslin.mobile-navigate']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/main', {controller: MainCtrl, templateUrl: 'main.html'}).
            when('/report', {controller: ReportCtrl, templateUrl: 'report.html'}).
            when('/list', {controller: ListCtrl, templateUrl: 'list.html'}).
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

        zoomProperty: 15,

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
                                format('MM-DD HH:mm');
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

function ListCtrl($scope, moment, serviceAPI, geolocation) {
    console.log('# in list ctrl');

    geolocation.getGeo({
        success: function(geo) {
            $scope.geo = geo;
        }
    });

    $scope.newCheckpoints = [];
    $scope.oneHourCheckpoints = [];
    $scope.twoHourCheckpoints = [];
    $scope.threeHourCheckpoints = [];
    $scope.oldCheckpoints = [];

    var checkpoints = [];
    serviceAPI.listCheckpoints({
        'maxResults': 100,
        'pageToken': 1,
        success: function(data) {
            for (var i = 0; i < data.items.length; i++) {
                var timestamp = data.items[i].timestamp;
                var formattedTime = moment(timestamp).format('MM-DD HH:mm');

                var timediff = moment().diff(timestamp, 'hours');
                switch(timediff) {
                    case 0:
                        $scope.newCheckpoints.push(data.items[i]);
                        break;
                    case 1:
                        $scope.oneHourCheckpoints.push(data.items[i]);
                        break;
                    case 2:
                        $scope.twoHourCheckpoints.push(data.items[i]);
                        break;
                    case 3:
                        $scope.threeHourCheckpoints.push(data.items[i]);
                        break;

                    default:
                        $scope.oldCheckpoints.push(data.items[i]);
                }
            }
        }
    });

    $scope.back2Map = function() {
        $navigate.go('/main');
    };

    $scope.pinOnMap = function() {
        console.log('# pin on map');
    };
}