var app = angular.module('dod', ['google-maps', 'dod-services']).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            otherwise({redirectTo: '/'});
    });

function MainCtrl($scope, geolocation, $log, serviceAPI) {
    console.log('# in main control');

    serviceAPI.checkpoints({
        success: function(data) {
            $scope.checkpoints = data.items;
        }
    });

    var geo = geolocation.getGeo();
    google.maps.visualRefresh = true;

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
        zoomProperty: 13,

        /** list of markers to put in the map */
        markersProperty: [$scope.checkpoints],

        // These 2 properties will be set when clicking on the map
        clickedLatitudeProperty: null,
        clickedLongitudeProperty: null,

        eventsProperty: {
          click: function (mapModel, eventName, originalEventArgs) {
            // 'this' is the directive's scope
            $log.log("user defined event on map directive with scope", this);
            $log.log("user defined event: " + eventName, mapModel, originalEventArgs);
          }
        }
    });

    $scope.reportLoc = function() {
        console.log('# report loc');

        serviceAPI.createCheckpoints({
            success: function(data) {
                console.log(data);
            }
        });
    };
}