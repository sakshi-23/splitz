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
                         $("#vcardbutton").trigger("click");

                },
                failure: function(errMsg) {
                    console.log(errMsg);
                }
                });


	 });

//	 $("#vcardbutton").on("click",function(){
//
//	 });


	  setInterval(function(){

         $.get("/user/"+user_id+"/notifications", function(data, status){
            var htm=""
            $("#transactionsList").html("");
            data = JSON.parse(data)
            if(notificationlength!=data.length){
                $(".notification").html(data.length)
                notificationlength=data.length;
                $(".notification").removeClass("hidden");
            }
            for (var i in data){
                    var notification = data[i];
                     htm='<li class="list-group-item col-md-12"><div class="col-md-9">'+notification.message+'</div>'
                     if (notification.status_code==1){
                        htm+='<div class="col-md-3"><button class="btn btn-xs btn-default"><span owner_id="'+notification.owner_id+'" data-id="'+notification.notification_id+'" class="accept glyphicon glyphicon-ok"></button><button class="btn btn-xs btn-default"></span><span class="glyphicon glyphicon-remove"></span></button></div>'
                     }
                     htm+='</li>'
                     $("#transactionsList").append(htm);

            }




        });


	   }, 5000);



        $("#activity").on("click",function(){
            $(".notification").addClass("hidden");

        })


    $(".done-shopping").on("click",function(){
        $(".payment-window").removeClass("hidden");
        $(".shopping").addClass("hidden");

    });

    $("body").on("click",".glyphicon-ok",function(){

       data= [{"status": "approve", "notification_id": $(this).attr("data-id"), "user_id": user_id, "status_code": 2, "message": "", "owner_id": $(this).attr("owner_id")}]
        $.ajax({
                type: "POST",
                url: "/manage-notification",
                data: JSON.stringify(data),

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


    })

    $(".populate").on("click",function(){

        $(".cardnm").val("5413330001000174");
        $(".expdatenm").val("12");
         $(".expyearnm").val("19");
           $(".ccvnm").val("432");
    })

    $(".pay").on("click",function(){
            var settings = {
              "async": true,
              "crossDomain": true,
              "url": "https://api.demo.convergepay.com/VirtualMerchantDemo/process.do?ssl_amount=1294.84&ssl_card_number=5413330001000174&ssl_exp_date=1219&ssl_merchant_id=009005&ssl_pin=U1U0BLQIGLQ0L781E4DFROL21NL2QJMFN468GQQOSOJF5KX2L3JIIKWWPG325CX3&ssl_transaction_type=ccsale&ssl_user_id=hackathon&ssl_show_form=false",
              "method": "POST",
              "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
                "postman-token": "ee83018d-b442-f0b3-ccbb-66a8dac5063c"
              },
              "data": ""
            }

            $.ajax(settings).done(function (response) {

              document.open();
                document.write(response);
                document.close();
            });


            var details= {
                "vcard_req_id" : "59da4339113de204435f09f4",
                "card_number" : "6407073014871305",
                "amount" : "200",
                "exp" : "01/21",
                "ccv" : "1294.84",
                "merchant_name":"Medical Hospital"
            }

            $.ajax({
                type: "POST",
                url: "/transact",
                data: JSON.stringify(details),

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



    });



});


function addAccountsinUI(details){
    var htm="";
    var members=[];
    for (var i in details){
               var detail = details[i];
               src="http://www.lucciarrosticini.it/shop/images/credit-card-2-icon-7.png"
               if(detail.type=="CHECKING"){
                src="https://d30y9cdsu7xlg0.cloudfront.net/png/41986-200.png"
           }
          $(".payments-list").append('<div class=""><div class= "user-cards btn btn-sm btn-default col-xs-12"> <div class="col-xs-3"><img class="card-img" src="'+src+'">  <span class="card-type">'+detail.type +'</span></div><div class="col-xs-6">'+detail.acc+'</div><div class="col-xs-3"> $'+detail.balance+'</div></div></div>');

            cardNumbers.push(detail.acc)

             members.push({"id":detail.acc,"text":detail.type+": "+detail.acc.substring(16,24)})
    }

         $(".user-cards").removeClass("bold");
        $(".user-cards:first").addClass("bold");


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


var cardNumbers=[],user_id,notificationlength=0;