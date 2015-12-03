angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {



  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});



  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
  { title: 'Reggae', id: 1 },
  { title: 'Chill', id: 2 },
  { title: 'Dubstep', id: 3 },
  { title: 'Indie', id: 4 },
  { title: 'Rap', id: 5 },
  { title: 'Cowbell', id: 6 }
  ];
})

.controller('WilzCtrl',function($scope, $http, $ionicLoading, $state,  ProfileService){

  $scope.server_url = ProfileService.getURL();
  $scope.usuario = {}
  //$scope.usuarionombre = "Carlos"
  $scope.userkey = "";
  $scope.usuarioIncorrecto = {'display':'none'};

  // Form data for the login modal
  $scope.loginData = {};

  $scope.pudoHacerLogin = false;

  $scope.updateNombre = function(){
    $scope.usuarionombre = "Luigys"
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

    var req = {
     method: 'POST',
     url: $scope.server_url.concat("/rest-auth/login/"),
     headers: {
       'Content-Type': "application/json"
     },
     data: { "email": $scope.loginData.email.toLowerCase().trim(), "password":$scope.loginData.password }
   }

   $http(req).then(function successCallback(response){
    $scope.usuarioIncorrecto = {'display':'none'};
    $scope.userkey = angular.fromJson(response.data).key;
    $scope.pudoHacerLogin = true;
    console.log($scope.userkey);
    window.localStorage.setItem("key",$scope.userkey); //Set the key in user Storage
    return ProfileService.setInfo($scope.userkey);
  }, function errorCallback(response){
    console.log(response.data);
    $ionicLoading.hide();
    $scope.usuarioIncorrecto = {'display':'block'};
    $scope.pudoHacerLogin = false;
    return response.data;
  })
   .then(function(){
    console.log($scope.pudoHacerLogin);
    if($scope.pudoHacerLogin){
      if($scope.userkey != ""){
        $state.go('profile.main');
      }
    }
    return true;
  });  

 }

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('ProfileCtrl',function($scope,$stateParams, ProfileService){
  var nombreUsuario = ProfileService.getNombreUsuario().split(" ")[0];
  var comunidad = ProfileService.getComunidad();
  $scope.nombreUsuario = nombreUsuario;
  $scope.comunidadUsuario = comunidad;

  var promise =  ProfileService.updateCaravanasUsuario();

  promise.then(function(){
    $scope.serviciosBici = ProfileService.getCaravanasUsuario();
  });



  $scope.hayServiciosBici = function(){
    if ((ProfileService.getCaravanasUsuario()).length >0){
      console.log("number");
      console.log(ProfileService.getCaravanasUsuario().length);
      return true;
    }else{
      return false;
    }

  };
})

//*********************************************************//
//---*******************CARAVANASCTRL---*******************//
//*********************************************************//
.controller('CaravanasCtrl',function($scope,$stateParams, $http, $ionicLoading, $ionicModal, ProfileService){

  $scope.caravanas = []
  $scope.caravanaActiva = []
  var caravanasUsuario = [];

  ProfileService.updateCaravanasUsuario();

  $http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
  var req = {
   method: 'GET',
   xhrFields: { withCredentials: true },
   url: ProfileService.getURL().concat("/api2/caravanas/"),
   headers: {
     'Content-Type': "application/json",
     'Authorization':"Token ".concat(ProfileService.getUserKey())
   },
   data: {}
 }

 $http(req).then(function successCallback(response){
  var lasCaravanas = angular.fromJson(response.data);
  for(var i = 0;i<lasCaravanas.length;i++){
    var laFecha = lasCaravanas[i].fecha_salida;

    var elDia = laFecha.substring(8,10);
    var elMes = laFecha.substring(5,7);
    var laHora = laFecha.substring(11,13);
    var losMin = laFecha.substring(14,16);

    $scope.caravanas.push({id:lasCaravanas[i].id,
      nombre:lasCaravanas[i].nombre,
      origen:lasCaravanas[i].origen,
      destino:lasCaravanas[i].destino,
      ruta:lasCaravanas[i].ruta,
      dia:elDia,
      mes:ProfileService.convertirMesALetras(elMes),
      hora:laHora,
      min:losMin,
      lider:lasCaravanas[i].lider});
  }
  console.log(lasCaravanas);
  console.log($scope.caravanas);
  return response.data;
}, function errorCallback(response){
  console.log(console.data);
  $ionicLoading.hide();
  return response.data;
});

 $ionicModal.fromTemplateUrl('contact-modal.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal = modal
})  

$scope.registrarSuscripcionCaravana = function(){
  console.log("suscripcion");
  console.log($scope.idCaravanaActiva);
  console.log($scope.caravanaActiva.direccion);
  console.log($scope.caravanaActiva.comentarios);

  $http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());

  var req = {
   method: 'POST',
   xhrFields: { withCredentials: true },
   url: ProfileService.getURL().concat("/api2/agregar-usuario-caravana/"),
   headers: {
     'Content-Type': "application/json",
     'Authorization':"Token ".concat(ProfileService.getUserKey())
   },
   data: { id_caravana:"".concat($scope.idCaravanaActiva), "direccion":$scope.caravanaActiva.direccion,"comentarios":$scope.caravanaActiva.comentarios}
 }

 $http(req).then(function(response){
  console.log(response.data);
  return ProfileService.updateCaravanasUsuario();
}).then(function(){
  for(var i = 0; i<$scope.caravanas;i++){
    $scope.estaInscritoEnCaravana = ProfileService.estaUsuarioEnCaravana($scope.caravanas[i].id);
  }
});


$scope.modal.hide();
$scope.caravanaActiva.direccion = "";
$scope.caravanaActiva.comentarios = "";

}

$scope.openModal = function(id, origen, destino) {
  $scope.idCaravanaActiva = id;
  $scope.origenCaravanaActiva = origen;
  $scope.destinoCaravanaActiva = destino;
  $scope.modal.show()
}

$scope.closeModal = function() {
  $scope.modal.hide();
  $scope.caravanaActiva.direccion = "";
  $scope.caravanaActiva.comentarios = "";
};

$scope.$on('$destroy', function() {
  $scope.modal.remove();
});

$scope.estaInscritoEnCaravana = function(idCaravana){
  return ProfileService.estaUsuarioEnCaravana(idCaravana);
}

})


//*********************************************************//
//---**********************RUTAS CTRL**********************//
//*********************************************************//
.controller('RutasCtrl',function($scope,$stateParams, $http, $ionicLoading, $ionicModal, ProfileService){

  $scope.rutas = []


  $http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
  var req = {
   method: 'GET',
   xhrFields: { withCredentials: true },
   url: ProfileService.getURL().concat("/api2/rutas/"),
   headers: {
     'Content-Type': "application/json",
     'Authorization':"Token ".concat(ProfileService.getUserKey())
   },
   data: {}
 }

 $http(req).then(function successCallback(response){
  var lasRutas = angular.fromJson(response.data);
  for(var i = 0;i<lasRutas.length;i++){

    $scope.rutas.push({id:lasRutas[i].id,
      nombre:lasRutas[i].nombre,
      origen:lasRutas[i].origen,
      destino:lasRutas[i].destino,
      ruta:lasRutas[i].ruta,
      costo:lasRutas[i].costo});
  }
  return response.data;
}, function errorCallback(response){
  $ionicLoading.hide();
  return response.data;
});

 $ionicModal.fromTemplateUrl('contact-modal.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal = modal
})  


})

//*********************************************************//
//---**********************ROUTER CTRL*********************//
//*********************************************************//
.controller('RouterCtrl',function($scope, $state, ProfileService){



  var llave = window.localStorage.getItem("key");
  if(llave != null){
    var userKey = window.localStorage.getItem("key");
    ProfileService.setInfo(userKey).then(function(){
      $state.go('profile.main');
    });
  }else{
    $state.go('home');
  }
})

.controller('ViajesCtrl',function($scope,$stateParams, $http, $ionicLoading, $ionicModal, ProfileService){
})

//*********************************************************//
//---**********************SIGNUP CTRL*********************//
//*********************************************************//
.controller('SignupCtrl',function($scope, $http, $ionicLoading, $state,$ionicPopup, ProfileService){


  $scope.signupData = {};

  $scope.errorSignup = {'display':'none'};
  // Perform the login action when the user submits the login form



  $scope.doSignup = function() {


    $scope.errorSignup = {'display':'none'};
    $scope.hayComunidad = false;
    $scope.hizoSignup = false;
    var contrasenasCoinciden = true;


    var req = {
     method: 'GET',
     xhrFields: { withCredentials: true },
     url: ProfileService.getURL().concat("/api/comunidades/"),
     headers: {
       'Content-Type': "application/json"
     },
     data: {  }
   }


   //Primer llamado a mirar las comunidades
   $http(req).then(function successCallback(response){
    console.log("estas son las comunidades");
    console.log(response.data);
    var comunidades = angular.fromJson(response.data);
    var hayComunidad = false;
    for (var i = 0; i < comunidades.length && !hayComunidad; i++){
      if(comunidades[i].url_email == $scope.signupData.email.toLowerCase().split("@")[1].trim()){
        hayComunidad = true;
      }
    }

    if($scope.signupData.password1.trim() != $scope.signupData.password2.trim()){
      $scope.errorSignupMensaje = "Las contraseñas no coinciden.";
      $scope.errorSignup = {'display':'block'};
      contrasenasCoinciden = false;
      $ionicLoading.hide();
    }

    if(contrasenasCoinciden){
      if(hayComunidad){
        console.log("sí hay comunidad");
        $scope.hayComunidad = true;
        $scope.errorSignup = {'display':'none'};
        req.method = "POST";
        req.url = ProfileService.getURL().concat("/rest-auth/registration/");
        req.data = { "email": $scope.signupData.email.toLowerCase().trim(),"username": $scope.signupData.email.toLowerCase().trim(), "password1":$scope.signupData.password1.trim(), "password2": $scope.signupData.password2.trim() };
        console.log($scope.hayComunidad);
        return $http(req);
      }else{
        console.log("No existe esta comunidad");
        $scope.errorSignupMensaje = "Tu comunidad no está registrada en la plataforma";
        $scope.errorSignup = {'display':'block'};
        return false;
      }
    }else{
      return false;
    }
    


  })
.then(function(response){
  console.log("voy a crear el usuario");
  console.log($scope.hayComunidad);
    //Hizo bien el signup, ahora va a crear el usuario
    if($scope.hayComunidad){
      console.log("hizo bien el signup");
      var userkey = angular.fromJson(response.data).key;
      console.log(userkey);
      $http.defaults.headers.common['Authorization'] = "Token ".concat(userkey);
      req.url = ProfileService.getURL().concat("/api2/registrar-usuario/");
      req.headers = {'Content-Type': "application/json",
      'Authorization':"Token ".concat(userkey)};
      req.data = { "email": $scope.signupData.email.toLowerCase().trim(), "nombre":$scope.signupData.nombre.trim(), "celular":$scope.signupData.celular.trim()};
      $scope.hizoSignup = true;
      return $http(req);
    }
    return false;
  },function(response){
    //Salió mal el signup

    $ionicLoading.hide();

    console.log("hizo mail el signup");
    console.log(response.data);
    if(response.data.password1!=null){
      $scope.errorSignupMensaje = "La contraseña debe ser mínimo de 6 caracteres.";
    }else if(response.data.email!=null){
      $scope.errorSignupMensaje = "Este email ya está registrado.";
    }
    $scope.errorSignup = {'display':'block'};
    return response.data;
  })
.then(function(response){
    //hizo bien el signup
    if($scope.hizoSignup){
      console.log("yuhuu");
      console.log(response.data);
      var alertPopup = $ionicPopup.alert({
       title: '¡Suscripcion Exitosa!',
       template: 'En unos minutos deberás activar tu cuenta en el correo que te enviaremos a '.concat($scope.signupData.email.toLowerCase().trim()).concat(". No olvides revisar tu bandeja de spam.")
     });
      alertPopup.then(function(res) {
        $state.go('home');
      });
    }
  });  
}
})


//*********************************************************//
//---******************CARAVANAS HOME CTRL*****************//
//*********************************************************//
.controller('CaravanasHomeCtrl',function($scope,$state, $stateParams, $http, $ionicLoading, $ionicModal, ProfileService, $ionicPopup){

  $scope.caravanasLider = []
  $scope.publicacionCaravana = []

//ACTUALIZA LAS CARAVANAS DE LIDER
$http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
var req = {
 method: 'GET',
 xhrFields: { withCredentials: true },
 url: ProfileService.getURL().concat("/api2/caravanas-lider-usuario/"),
 headers: {
   'Content-Type': "application/json",
   'Authorization':"Token ".concat(ProfileService.getUserKey())
 },
 data: {}
}

$http(req).then(function successCallback(response){
  var lasCaravanas = angular.fromJson(response.data);
  for(var i = 0;i<lasCaravanas.length;i++){
    var laFecha = lasCaravanas[i].fecha_salida;

    var elDia = laFecha.substring(8,10);
    var elMes = laFecha.substring(5,7);
    var laHora = laFecha.substring(11,13);
    var losMin = laFecha.substring(14,16);

    $scope.caravanasLider.push({id:lasCaravanas[i].id,
      origen:lasCaravanas[i].origen,
      destino:lasCaravanas[i].destino,
      ruta:lasCaravanas[i].ruta,
      dia:elDia,
      mes:ProfileService.convertirMesALetras(elMes),
      hora:laHora,
      min:losMin,
      lider:lasCaravanas[i].lider});
  }
  console.log(lasCaravanas);
  console.log($scope.caravanasLider);
  return response.data;
}, function errorCallback(response){
  console.log(console.data);
  $ionicLoading.hide();
  return response.data;
});




$ionicModal.fromTemplateUrl('publicar-caravana-modal.html', {
  scope: $scope,
  animation: 'slide-in-up'
}).then(function(modal) {
  $scope.modal = modal
})

$scope.openModal = function() {
  $scope.modal.show()
};

 // A confirm dialog
 $scope.showConfirm = function(id_caravana) {



   var confirmPopup = $ionicPopup.confirm({
     title: 'Empezar recorrido',
     template: 'Estas a punto de empezar tu recorrido como lider de caravana. Tu ubicación se mostrará a los usuarios inscritos a tu caravana.',
     cancelText: 'Cancelar',
     okText: 'Empezar'
   });
   confirmPopup.then(function(res) {
     if(res) {


      $http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
      var req = {
       method: 'POST',
       xhrFields: { withCredentials: true },
       url: ProfileService.getURL().concat("/api2/empezar-publicacion-caravana/"),
       headers: {
         'Content-Type': "application/json",
         'Authorization':"Token ".concat(ProfileService.getUserKey())
       },
       data: {"id_caravana":id_caravana}
     }

     $http(req).then(function successCallback(response){
      ProfileService.setCaravanaTracking(id_caravana);
      console.log(id_caravana);
      $state.go('tracking');

    }, function errorCallback(response){
      console.log(console.data);
      $ionicLoading.hide();
      return response.data;
    });
     
   } else {
   }
 });
};

$scope.closeModal = function() {
  $scope.modal.hide();
  $scope.publicacionCaravana.origen = "";
  $scope.publicacionCaravana.destino = "";
  $scope.publicacionCaravana.ruta = "";
  $scope.publicacionCaravana.fecha_dia = "";
  $scope.publicacionCaravana.fecha_hora = "";
};

$scope.$on('$destroy', function() {
  $scope.modal.remove();
});




$scope.registrarPublicacionCaravana = function(){

  $http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());

  if(verificarFecha($scope.publicacionCaravana.fecha_dia,$scope.publicacionCaravana.fecha_hora)){
    console.log("entro");
    $scope.errorFechaCaravana = {'display':'none'};
    var fecha = "2015-".concat($scope.publicacionCaravana.fecha_dia).concat("T").concat($scope.publicacionCaravana.fecha_hora).concat(":00Z");
  }else{
    $scope.errorFechaCaravanaMensaje = "Debe escribir la fecha como MM-DD y la hora como HH:MM";
    $scope.errorFechaCaravana = {'display':'block'};
    return false;
  }
  var req = {
   method: 'POST',
   xhrFields: { withCredentials: true },
   url: ProfileService.getURL().concat("/api2/publicar-caravana/"),
   headers: {
     'Content-Type': "application/json",
     'Authorization':"Token ".concat(ProfileService.getUserKey())
   },
   //data: {"origen":$scope.publicacionCaravana.origen,"destino":$scope.publicacionCaravana.destino,"ruta":$scope.publicacionCaravana.ruta,"fecha_salida":$scope.publicacionCaravana.fecha_salida}

   data: {"origen":$scope.publicacionCaravana.origen,"destino":$scope.publicacionCaravana.destino,"ruta":$scope.publicacionCaravana.ruta,"fecha_salida":fecha}
   
 }

 $http(req).then(function(response){
  console.log(response.data);
}).then(function(){
  $state.go($state.current, {}, {reload: true});
});


$scope.modal.hide();
$scope.publicacionCaravana.origen = "";
$scope.publicacionCaravana.destino = "";
$scope.publicacionCaravana.ruta = "";
$scope.publicacionCaravana.fecha_dia = "";
$scope.publicacionCaravana.fecha_hora = "";

}

function verificarFecha(mesdia,hora){
  console.log(/^([0-9][0-9]-[0-9][0-9])$/.test(mesdia));
  if(!(/^([0-9][0-9]-[0-9][0-9])$/.test(mesdia))){
    return false;
  }
  console.log(/^([0-9][0-9]:[0-9][0-9])$/.test(hora));
  if(!(/^([0-9][0-9]:[0-9][0-9])$/.test(hora))){
    return false;
  }
  return true;
}

})
