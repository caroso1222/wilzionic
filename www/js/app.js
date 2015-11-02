// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.service('ProfileService',function($http){
  //var server_url = "http://192.168.0.3:8000"
  //var server_url = "http://localhost:8000"
  //var server_url = "http://felizcumplemagda.com"
  var server_url = "http://wilzapi.caroso1222.webfactional.com"
  var nombreUsuario = "";
  var celUsuario = "";
  var idComunidad = "";
  var usuarioKey = "";
  var nombreComunidad = "";
  var caravanasUsuario = [];

  this.getURL = function(){
    return server_url;
  }

  this.getCaravanasUsuario = function(){
    return caravanasUsuario;
  }

  this.getNombreUsuario = function(){
    return nombreUsuario;
  }

  this.getComunidad = function(){
    return nombreComunidad;
  }

  this.getUserKey = function(){
    return usuarioKey;
  }

  this.setUserKey = function(newUserKey){
    userKey = newUserKey;
  }

  this.updateCaravanasUsuario = function(){
    $http.defaults.headers.common['Authorization'] = "Token ".concat(usuarioKey);

    var req = {
     method: 'GET',
     xhrFields: { withCredentials: true },
     url: server_url.concat("/api2/caravanas-usuario/"),
     headers: {
       'Content-Type': "application/json",
       'Authorization':"Token ".concat(usuarioKey)
     },
     data: { }
   }

   caravanasUsuario = [];
   return $http(req).then(function(response){
    caravanas = angular.fromJson(response.data);
    for (var i = 0; i < caravanas.length; i++){
      console.log(darFechaEnArreglo(caravanas[i].fecha_salida));
      caravanasUsuario.push({id:caravanas[i].id,origen:caravanas[i].origen,destino:caravanas[i].destino,fecha:darFechaEnArreglo(caravanas[i].fecha_salida)[0]});
    }
    return response.data;
  }); 
 }

 function darFechaEnArreglo(fecha){
  var elDia = fecha.substring(8,10);
  var elMes = fecha.substring(5,7);
  var laHora = fecha.substring(11,13);
  var losMin = fecha.substring(14,16);
  var salida = [];
  salida.push({dia:elDia,hora:laHora,min:losMin,mes:convertirMesALetras(elMes)});
  return salida;
}

this.convertirMesALetras = function(num){
  return convertirMesALetras(num);
}


function convertirMesALetras(num){
  if(num == "01"){
    return "ENE";
  }else if(num == "02"){
    return "FEB";
  }else if(num == "03"){
    return "MAR";
  }else if(num == "04"){
    return "ABR";
  }else if(num == "05"){
    return "MAY";
  }else if(num == "06"){
    return "JUN";
  }else if(num == "07"){
    return "JUL";
  }else if(num == "08"){
    return "AGO";
  }else if(num == "09"){
    return "SEP";
  }else if(num == "10"){
    return "OCT";
  }else if(num == "11"){
    return "NOV";
  }else if(num == "12"){
    return "DIC";
  }
}

this.estaUsuarioEnCaravana = function(idCaravana){
  for(var i = 0; i < caravanasUsuario.length; i++){
    if(caravanasUsuario[i].id == idCaravana){
      return true;
    }
  }
  return false;
}

this.setInfo = function(userKey){

  usuarioKey = userKey;

  $http.defaults.headers.common['Authorization'] = "Token ".concat(userKey);

  var req = {
   method: 'GET',
   xhrFields: { withCredentials: true },
   url: server_url.concat("/api2/usuario/"),
   headers: {
     'Content-Type': "application/json",
     'Authorization':"Token ".concat(userKey)
   },
   data: { }
 }

 return $http(req).then(function(response){
  nombreUsuario = angular.fromJson(response.data)[0].nombre;
  celUsuario = angular.fromJson(response.data)[0].celular;
  idComunidad = angular.fromJson(response.data)[0].comunidad;
  req.url = server_url.concat("/api/comunidades/").concat(idComunidad).concat("/");
  return $http(req);
})
 .then(function(response){
  nombreComunidad = angular.fromJson(response.data).nombre;
  return response.data;
});   

}

})


.run(function($ionicPlatform, $ionicLoading, $rootScope) {

  $rootScope.$on('loading:show', function() {
    //$ionicLoading.show({template: 'Un momento por favor...'})
    $ionicLoading.show({template: '<img src="./img/loading.gif">'})
    //$ionicLoading.show({templateUrl: 'templates/loading.html'})
  })

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  if (window.cordova && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    cordova.plugins.Keyboard.disableScroll(true);

  }
  if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

  //º$httpProvider.defaults.useXDomain = true;

  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })

  $stateProvider

  .state('home', {
    url: '/login',
    templateUrl: 'templates/logindef.html',
    controller: 'WilzCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('profile', {
    url: '/profile',
    abstract: true,
    templateUrl: 'templates/menu.html',
  })

  .state('prerouter', {
    url: '/prerouter',
    controller: 'RouterCtrl',
    template: '',
  })

  .state('profile.main', {
    url: '/profile',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })


  .state('profile.caravanas', {
    cache: false,
    url: '/caravanas',
    views: {
      'menuContent': {
        templateUrl: 'templates/caravanas.html',
        controller: 'CaravanasCtrl'
      }
    }
  })


  .state('profile.rutas', {
    url: '/profile/rutas',
    views: {
      'menuContent': {
        templateUrl: 'templates/rutas.html',
        controller: 'RutasCtrl'
      }
    }
  })

  .state('profile.viajes', {
    url: '/viajes',
    views: {
      'menuContent': {
        templateUrl: 'templates/viajes.html',
        controller: 'ViajesCtrl'
      }
    }
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })
  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('prerouter');
  
  //$urlRouterProvider.otherwise('/app/caravanas');
  //$urlRouterProvider.otherwise('/app/profile');
});
