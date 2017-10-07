  window.fbAsyncInit = function() {
    FB.init({
      appId      : '141180229950763',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();

    if( window.location.pathname=="/"){
      FB.login(function(response) {
             checkLoginState()
        }, {scope: 'public_profile,email,user_friends'});
    }
    else
    {   FB.getLoginStatus(function(response) {
        statusChangeCallback(response);

    });
}

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
        function (response) {
          if (response && !response.error) {
            console.log(response.name)
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

}