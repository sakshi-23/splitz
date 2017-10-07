
var module = angular.module('myApp', []);
module.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{').endSymbol('}');
});

module.controller('Controller',['$scope','titleService', function($scope,$rootScope,titleService) {

$scope.param='totalPrice'
$scope.loading=true




}]);


