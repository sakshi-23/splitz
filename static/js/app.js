$(document).ready(function() {
	$(".btn-pref .btn").click(function () {
	   $(".btn-pref .btn").removeClass("btn-primary")
	   // $(".tab").addClass("active"); // instead of this do the below
	   $(this).addClass("btn-primary");
	});

	$(".add-account").on("click",function(){
		$(".show-accounts").removeClass("hidden");

	})

	$("#addIdButon").on("click",function(){
//		$(".show-accounts").addClass("hidden");
		//Ajax call




        var markers = {"LegalParticipantIdentifier": "913995730031830909"}

       $.ajax({
            type: "POST",
            url: "https://api119525live.gateway.akana.com:443/user/accounts",
            data: JSON.stringify(markers),

            dataType: "json",
               headers: {
          'Content-Type': 'application/json',

      },
            success: function(data){
                results = data.AccessibleAccountDetailList;
                for (var i in results){
                       var detail = {

                                "balance": results[i].BasicAccountDetail.Balances.AvailableBalanceAmount,
                                "acc": results[i].BasicAccountDetail.RedactedAccountNumber,
                                "type": results[i].BasicAccountDetail.Codes.CategoryDescription
                       }

                     $(".payments-list").append('<div><div class="btn btn-sm btn-default col-md-12"> <div class="col-md-4">#'+(1+parseInt(i))+': '+detail.type +'</div><div class="col-md-5">'+detail.acc+'</div><div class="col-md-3"> $'+detail.balance+'</div></div></div>');

                }
            },
            failure: function(errMsg) {
                console.log(errMsg);
            }
        });


	})

	$("#paymentSplit").on("click",function(){
		$(".show-split").removeClass("hidden");

	})

	$("enter").on("click",function(){
		$(".show-split").append(' <div><div class="col-md-8">Name</div> <input class="col-md-3" type="number" name="limit" class="amount"></div>');
	});








});


