var module=angular.module('myApp');
module.service('titleService',titleService)

function titleService($q,$http,$httpParamSerializer,$filter){
    this.getFlights = getFlights;

    this.getProfile =getProfile;

    function getProfile(){
      var settings = {
          "async": true,
          "crossDomain": true,
          "method": "GET",
          "headers": {
            "authorization": "Bearer y)5K2GdKzbO7Zv_!kc3Ymj!iseq1-Giq2RKVWRexRhPU)6M_ejGR-phASjBetz4QDCA0GKXHB6FJG3SiP6rN",
            "content-type": "application/json",
            "cache-control": "no-cache",
            "postman-token": "847d1758-8c93-a371-88df-73a75f6c55fb"
          }
        }

        fetch("https://private-anon-d6b6dfc913-appintheair.apiary-mock.com/api/v1/me",settings).then(function (response) {
          return (response.json().data);
        });

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
