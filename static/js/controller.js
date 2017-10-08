
var module = angular.module('myApp', []);
module.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{').endSymbol('}');
});

module.controller('Controller',['$scope','$http', function($scope,$http) {

$scope.param='totalPrice'
$scope.loading=true

$scope.getCards=function(){

   $http.get("/user/"+user_id+"/vcards", function(data, status){
            var htm=""
            $("#cardgroup").html("");
            data = JSON.parse(data)
            console.log(data)
            })
            .success(function(data) {
            $scope.cardInfo=data
             setTimeout(function(){
                $(".vcardhidden:first").removeClass("ng-hide");
             },100)

           }).error(function(msg, code) {

             console.log("rejected")
           });





}


}]);


