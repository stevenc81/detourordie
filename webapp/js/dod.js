var app = angular.module('dod', []).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: MainCtrl, templateUrl: 'main.html'}).
            otherwise({redirectTo: '/'});
    });

function MainCtrl($scope) {
    console.log('in main control');
}