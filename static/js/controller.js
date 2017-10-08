
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

     $("body").on("click","#createCard",function(){


	    var accounts=[];
	    var val= $("#addMembers").select2('data');
	    for (var i in val){
	        var member = val[i];

	        if(!("_resultId"  in member)){
	            member["user_exists"] = true;
	            if(member["id"].indexOf("*")!=-1){
                    member["user_id"] = user_id
                    }
                else
                {
                    member["facebook_id"] = member["id"]

                }
	        }
	        else{
	             member["user_exists"] = false
	        }


	        member["amount"]=$('[data-id="'+member.id+'"]').val();
            accounts.push(member)
	    }

	   var data= {
            "amount" : $("#limit").val(),
            "single_use" : $("#singleuse").val()=='on'?true:false,
            "owner_user_id" : user_id,
            "accounts": accounts,
            "desc": $("#desc").val()
        }

          $.ajax({
                type: "POST",
                url: "/create_vcard",
                data: JSON.stringify(data),

                dataType: "json",
                   headers: {
                  'Content-Type': 'application/json',

                  },
                success: function(data){
                         console.log(data);
                           $scope.getCards();
                           $("#vcardbutton").trigger("click")


                },
                failure: function(errMsg) {
                    console.log(errMsg);
                }
                });


	 });






}]);


