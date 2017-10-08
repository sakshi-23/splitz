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
		$(".show-accounts").addClass("hidden");
		//Ajax call
		$(".payments-list").prepend('<div><span class="btn btn-sm btn-default col-md-8">#1: Account Ending in '+$("#accountId").val().substring(0,4)+'</span></div>');


	})

	$("#paymentSplit").on("click",function(){
		$(".show-split").removeClass("hidden");

	})

	$("enter").on("click",function(){
		$(".show-split").append(' <div><div class="col-md-8">Name</div> <input class="col-md-3" type="number" name="limit" class="amount"></div>');
	})


});


