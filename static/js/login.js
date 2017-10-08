  window.fbAsyncInit = function() {
    FB.init({
      appId      : '141180229950763',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();

    if( window.location.pathname!="/"){
      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);

    });
    }
//    FB.onlogin(function(response) {
//             checkLoginState()
//        }, {scope: 'public_profile,email,user_friends'});
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));


function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);

  });
}


function statusChangeCallback(response){

    if(response.status!="connected"){
        return;
    }
    if( window.location.pathname!="/profile"){
        window.location.href = "/profile";
        return
    }


    FB.api(
    "/"+response.authResponse.userID,
        function (responsename) {
          if (responsename && !responsename.error) {

            $(".profile-name").html(responsename.name);
             $.ajax({
            type: "POST",
            url: "/register",
            data: JSON.stringify({"facebook_id":response.authResponse.userID,"name":responsename.name}),

            dataType: "json",
               headers: {
          'Content-Type': 'application/json',
      },
            success: function(data){
               console.log(data);
            },
            failure: function(errMsg) {
                console.log(errMsg);
            }
        });
          }
        }
    );

    FB.api(
    "/"+response.authResponse.userID+"/friends",
    function (response) {
      if (response && !response.error) {
        /* handle the result */
        console.log(response.data[0].name)
      }
    }
    );

    FB.api(
    "/"+response.authResponse.userID+"/picture",
    function (response) {
      if (response && !response.error) {
        $(".profileImg").attr("src",response.data.url);
      }
    }
);

}