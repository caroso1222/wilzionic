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
     data: { "email": $scope.loginData.email, "password":$scope.loginData.password }
   }

   $http(req).then(function successCallback(response){
    $scope.usuarioIncorrecto = {'display':'none'};
    $scope.userkey = angular.fromJson(response.data).key;
    return ProfileService.setInfo($scope.userkey);
  }, function errorCallback(response){
    console.log(response.data);
    $ionicLoading.hide();
    $scope.usuarioIncorrecto = {'display':'block'};
    return response.data;
  })
   .then(function(){
    if($scope.userkey != ""){
      $state.go('profile.main');
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



.controller('CaravanasCtrl',function($scope,$stateParams, $http, $ionicLoading, $ionicModal, ProfileService){

  $scope.caravanas = []
  $scope.caravanaActiva = []
  var caravanasUsuario = [];

  console.log("esta es la llave");
  console.log(ProfileService.getUserKey());
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



.controller('ViajesCtrl',function($scope,$stateParams, $http, $ionicLoading, $ionicModal, ProfileService){
})

.controller('SignupCtrl',function($scope, $http, $ionicLoading, $state,$ionicPopup, ProfileService){


  $scope.signupData = {};

  $scope.errorSignup = {'display':'none'};
  // Perform the login action when the user submits the login form



  $scope.doSignup = function() {


    $scope.errorSignup = {'display':'none'};


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
      if(comunidades[i].url_email == $scope.signupData.email.split("@")[1]){
        hayComunidad = true;
      }
    }

    if(hayComunidad){
      console.log("sí hay comunidad");
      $scope.errorSignup = {'display':'none'};
      req.method = "POST";
      req.url = ProfileService.getURL().concat("/rest-auth/registration/");
      req.data = { "email": $scope.signupData.email,"username": $scope.signupData.email, "password1":$scope.signupData.password1, "password2": $scope.signupData.password1 };
      return $http(req);
    }else{
     $scope.errorSignup = {'display':'block'};
     $scope.errorSignupMensaje = "Tu comunidad no está registrada en la plataforma";
     return true;
   }


 })
   .then(function(response){
    //Hizo bien el signup, ahora va a crear el usuario
    console.log("hizo bien el signup");
    console.log(response.data);
    var userkey = angular.fromJson(response.data).key;
    console.log(userkey);
    $http.defaults.headers.common['Authorization'] = "Token ".concat(userkey);
    req.url = ProfileService.getURL().concat("/api2/registrar-usuario/");
    req.headers = {'Content-Type': "application/json",
    'Authorization':"Token ".concat(userkey)};
    req.data = { "email": $scope.signupData.email, "nombre":$scope.signupData.nombre, "celular":$scope.signupData.celular};

    return $http(req);
  },function(response){
    //Salió mal el signup
    console.log(response.data);
    return response.data;
  })
   .then(function(response){
    //hizo bien el signup
    console.log("yuhuu");
    console.log(response.data);
    
    var alertPopup = $ionicPopup.alert({
     title: '¡Suscripcion Exitosa!',
     template: 'En unos minutos deberás activar tu cuenta en el correo que te enviaremos a '.concat($scope.signupData.email).concat(". No olvides revisar tu bandeja de spam.")
   });
    alertPopup.then(function(res) {
      $state.go('home');
   });

  });  
 }
})
