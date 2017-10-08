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

        var markers = {"LegalParticipantIdentifier":$("#accountId").val() }
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
            details=[]
            for (var i in results){
                   var detail = {

                            "balance": results[i].BasicAccountDetail.Balances.AvailableBalanceAmount,
                            "acc": results[i].BasicAccountDetail.RedactedAccountNumber,
                            "type": results[i].BasicAccountDetail.Codes.CategoryDescription
                   }
                   if(cardNumbers.indexOf(detail['acc'])==-1)
                        details.push(detail)
            }
            addAccountsinUI(details);

            $.ajax({
                type: "POST",
                url: "/add_accounts",
                data: JSON.stringify({'user_id':user_id,'accounts':details}),

                dataType: "json",
                   headers: {
                  'Content-Type': 'application/json',

                  },
                success: function(data){

                },
                failure: function(errMsg) {
                    console.log(errMsg);
                }
                });
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


	$('#addMembers').on("change", function (e) {

        var val= $("#addMembers").select2('data')
        var htm="";
        length = val.length;
        for (var i in val){
            htm+='<div class="col-md-8">'+val[i].text+'</div> <input data-id="'+val[i].id+'" value="'+(100/length).toFixed(2)+'"  type="number" name="amt" class="amount col-md-3">';
        }
	    $(".show-split").html(htm);

	 });


	 $("#createCard").on("click",function(){


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
            "accounts": accounts
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
                         $("#vcardbutton").trigger("click");

                },
                failure: function(errMsg) {
                    console.log(errMsg);
                }
                });


	 })


	  setInterval(function(){

         $.get("/user/"+user_id+"/notifications", function(data, status){
            var htm=""
            $("#transactionsList").html("");
            data = JSON.parse(data)
            for (var i in data){
                    var notification = data[i];
                     htm='<li class="list-group-item col-md-12"><div class="col-md-9">'+notification.message+'</div>'
                     if (notification.status_code==1){
                        htm+='<div class="col-md-3"><button class="btn btn-xs btn-default"><span class="accept glyphicon glyphicon-ok"></button><button class="btn btn-xs btn-default"></span><span class="glyphicon glyphicon-remove"></span></button></div>'
                     }
                     htm+='</li>'
                     $("#transactionsList").append(htm);

            }




        });


	   }, 5000);










});


function addAccountsinUI(details){
    var htm="";
    var members=[];
    for (var i in details){
           var detail = details[i];
          $(".payments-list").append('<div><div class="btn btn-sm btn-default col-md-12"> <div class="col-md-4">#'+(1+parseInt(i))+': '+detail.type +'</div><div class="col-md-5">'+detail.acc+'</div><div class="col-md-3"> $'+detail.balance+'</div></div></div>');
            cardNumbers.push(detail.acc)

             members.push({"id":detail.acc,"text":detail.type+": "+detail.acc.substring(16,24)})
    }





//          $('#addMembers').empty();
        $('#addMembers').select2({
            data: [{
                  id      : 100,
                  text    : 'Self',
                  children: members
                }],
             tags: true,
            placeholder: "Add members",
            allowClear: true
        });



}


var cardNumbers=[],user_id;