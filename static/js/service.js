var module=angular.module('myApp');
module.service('titleService',titleService)

function titleService($q,$http,$httpParamSerializer,$filter){
    this.getFlights = getFlights;

    this.getCards =getCards;

    function getCards(){




           }




    function getFlights($scope){
    	 var deferred = $q.defer();
    	 var myBody = $scope.cities;

         $http.post('http://localhost:3000/get_best_deal',

            {data: {
               "start_city": $scope.cityCatalog[$scope.startingPoint],
                "cities": myBody ,
                "start_date": $filter('date')($scope.startDate,'yyyy-MM-dd')
}}

            )
           .success(function(data) {
              deferred.resolve({
                 result: data});
           }).error(function(msg, code) {
              deferred.reject(msg);
             console.log("rejected")
           });
         return deferred.promise;
           }
    }
