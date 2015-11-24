window.onload = function(){
	console.log("empiezo");
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
		document.addEventListener("deviceready", onDeviceReady, false);
	} else {
		onDeviceReady();
	}	
};

function onDeviceReady(){
	console.log("device listo");
}



angular.module('starter.caravanas', ['ngCordova'])


//*********************************************************//
//---***************CARAVANAS COMUNIDAD CTRL***************//
//*********************************************************//
.controller('CaravanasComunidadCtrl',function($scope,$state, $stateParams, $http, $ionicLoading, $ionicModal, ProfileService){
	$scope.caravanas = [] //Las caravanas que han publicado otros usuarios en esta comunidad
	$scope.caravanaActiva = [] //Modela la carava a la que el usuario se está suscribiendo
	var caravanasUsuario = [];

	ProfileService.updatePublicacionesCaravanasUsuario();


	$http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
	var req = {
		method: 'GET',
		xhrFields: { withCredentials: true },
		url: ProfileService.getURL().concat("/api2/publicaciones-caravanas/"),
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
				lider:lasCaravanas[i].el_lider,
				origen:lasCaravanas[i].origen,
				destino:lasCaravanas[i].destino,
				ruta:lasCaravanas[i].ruta,
				dia:elDia,
				mes:ProfileService.convertirMesALetras(elMes),
				hora:laHora,
				min:losMin});
		}
		return response.data;
	}, function errorCallback(response){
		$ionicLoading.hide();
		return response.data;
	});

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

	$scope.estaInscritoEnPublicacionesCaravanas = function(idCaravana){
		return ProfileService.estaUsuarioEnPublicacionesCaravanas(idCaravana);
	}

	$ionicModal.fromTemplateUrl('contact-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	})  

	$scope.anularSuscripcion = function(idCaravana){
		$http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
		var req = {
			method: 'POST',
			xhrFields: { withCredentials: true },
			url: ProfileService.getURL().concat("/api2/anular-suscripcion-a-publicacion-caravana/"),
			headers: {
				'Content-Type': "application/json",
				'Authorization':"Token ".concat(ProfileService.getUserKey())
			},
			data: { id_caravana:"".concat(idCaravana)}
		}

		$http(req).then(function(response){
			console.log(response.data);
			return ProfileService.updatePublicacionesCaravanasUsuario();
		}).then(function(){
			for(var i = 0; i<$scope.caravanas;i++){
				$scope.estaInscritoEnCaravana = ProfileService.estaUsuarioEnPublicacionesCaravanas($scope.caravanas[i].id);
			}
		});
	}

	$scope.registrarSuscripcionCaravana = function(){
		$http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());

		var req = {
			method: 'POST',
			xhrFields: { withCredentials: true },
			url: ProfileService.getURL().concat("/api2/agregar-usuario-publicacion-caravana/"),
			headers: {
				'Content-Type': "application/json",
				'Authorization':"Token ".concat(ProfileService.getUserKey())
			},
			data: { id_caravana:"".concat($scope.idCaravanaActiva), "direccion":$scope.caravanaActiva.direccion,"comentarios":$scope.caravanaActiva.comentarios}
		}

		$http(req).then(function(response){
			console.log(response.data);
			return ProfileService.updatePublicacionesCaravanasUsuario();
		}).then(function(){
			for(var i = 0; i<$scope.caravanas;i++){
				$scope.estaInscritoEnCaravana = ProfileService.estaUsuarioEnPublicacionesCaravanas($scope.caravanas[i].id);
			}
		});


		$scope.modal.hide();
		$scope.caravanaActiva.direccion = "";
		$scope.caravanaActiva.comentarios = "";
	}
})

.controller('ShowMapCtrl1',function($scope,$cordovaGeolocation){

	$scope.latitud = 0;
	$scope.longitud = 0;
	$scope.log_location = 10;

	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	$cordovaGeolocation
	.getCurrentPosition(posOptions)
	.then(function (position) {
		$scope.latitud  = position.coords.latitude
		$scope.longitud = position.coords.longitude
	}, function(err) {
      // error
  });

	document.addEventListener('deviceready', onDeviceReady1, false);

	

	function onDeviceReady1 () {
		var backgroundGeoLocation = window.backgroundGeolocation;
		console.log("entro a android")
	// BackgroundGeoLocation is highly configurable. See platform specific configuration options 
	backgroundGeoLocation.configure(callbackFn, failureFn, {
		desiredAccuracy: 10,
		stationaryRadius: 20,
		distanceFilter: 30,
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle. 
        stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates 
    });

	var callbackFn = function(location) {
		console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
		$scope.log_location = '[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude;
		backgroundGeoLocation.finish();
	};

	var failureFn = function(error) {
		console.log('BackgroundGeoLocation error');
	};

    // BackgroundGeoLocation is highly configurable. See platform specific configuration options 
    backgroundGeoLocation.configure(callbackFn, failureFn, {
    	desiredAccuracy: 10,
    	stationaryRadius: 20,
    	distanceFilter: 30,
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle. 
        stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates 
    });

    backgroundGeoLocation.start();

    $scope.stopBackgroundGeolocation = function () {
    	backgroundGeoLocation.start();
    	console.log("detengo");
    };
}


})

.controller('ShowMapCtrl',function($scope,$cordovaGeolocation, $cordovaBackgroundGeolocation, $http, $rootScope, $ionicLoading, ProfileService, ClockSrv){

	$scope.latitud = 0;
	$scope.longitud = 0;
	$scope.log_location = 10;

	var posOptions = {timeout: 10000, enableHighAccuracy: false};
	$cordovaGeolocation
	.getCurrentPosition(posOptions)
	.then(function (position) {
		$scope.latitud  = position.coords.latitude
		$scope.longitud = position.coords.longitude
	}, function(err) {
      // error
  });

	//Es el clock para actualizar el mapa
	$rootScope.$on('loading:show', function() {
    //$ionicLoading.show({template: 'Un momento por favor...'})
    $ionicLoading.hide();
    //$ionicLoading.show({templateUrl: 'templates/loading.html'})
});/*
	ClockSrv.startClock(function(){
		console.log("pregunto1")
		$http.defaults.headers.common['Authorization'] = "Token ".concat(ProfileService.getUserKey());
		var req = {
			method: 'GET',
			xhrFields: { withCredentials: true },
			url: ProfileService.getURL().concat("/api2/get-location-2/"),
			headers: {
				'Content-Type': "application/json",
				'Authorization':"Token ".concat(ProfileService.getUserKey())
			},
			data: {}
		}

		$http(req).then(function successCallback(response){

			var ubicacion = angular.fromJson(response.data);
			var longitud = ubicacion.longitud
			var latitud = ubicacion.latitud
			$scope.longitud = longitud
			$scope.latitud = latitud
			return response.data;
		}, function errorCallback(response){
			return response.data;
		});
	});*/

	$rootScope.$on('$stateChangeStart', 
		function(event, toState, toParams, fromState, fromParams){ 
			ClockSrv.stopClock();
			$rootScope.$on('loading:show', function() {
    //$ionicLoading.show({template: 'Un momento por favor...'})
    $ionicLoading.show({template: '<img src="./img/loading.gif">'})
    //$ionicLoading.show({templateUrl: 'templates/loading.html'})
});
		});
/*
	var options = {
        url: 'http://only.for.android.com/update_location.json', // <-- Android ONLY:  your server url to send locations to
        params: {
            auth_token: 'user_secret_auth_token',    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
            foo: 'bar'                              //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
        },
        headers: {                                   // <-- Android ONLY:  Optional HTTP headers sent to your configured #url when persisting locations
        	"X-Foo": "BAR"
        },
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
        notificationText: 'ENABLED', // <-- android only, customize the text of the notification
        activityType: 'AutomotiveNavigation',
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
    };
    

ionic.Platform.ready(function(){
    // will execute when device is ready, or immediately if the device is already ready.
    // `configure` calls `start` internally
    $cordovaBackgroundGeolocation.configure(options)
    .then(
      null, // Background never resolves
      function (err) { // error callback
      	console.error(err);
      },
      function (location) { // notify callback
      	console.log(location);
      	$scope.log_location = location;
      });


    $scope.stopBackgroundGeolocation = function () {
    	$cordovaBackgroundGeolocation.stop();
    };
});*/

console.log("pregunto");

document.addEventListener('deviceready', onDeviceReady1, false);

function onDeviceReady1 () {
	console.log("Entro android");
	var bgGeo = window.BackgroundGeolocation;
	bgGeo.configure(function(){console.log("uhumm")}, function(){console.log("uhumerrorm")}, {
        url: ProfileService.getURL().concat("/api2/post-location/"), // <-- Android ONLY:  your server url to send locations to
        //url: 'http://posttestserver.com/post.php',
        params: {
            auth_token: "Token ".concat(ProfileService.getUserKey()),    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
            withCredentials: true,
            Authorization: "Token ".concat(ProfileService.getUserKey())
        },
        headers: {
        	'Content-Type': "application/json",
        	'Authorization':"Token ".concat(ProfileService.getUserKey())
        },
        desiredAccuracy: 5,
        stationaryRadius: 10,
        distanceFilter: 20,
        notificationTitle: 'Wilz tracking', // <-- android only, customize the title of the notification
        notificationText: 'Activado', // <-- android only, customize the text of the notification
        activityType: 'AutomotiveNavigation',
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
    });

bgGeo.start();

$scope.stopBackgroundGeolocation = function () {
	bgGeo.stop();
	console.log("detengo");
};
}


/*
if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    bgGeo.configure(function(){console.log("uhumm")}, function(){console.log("uhumerrorm")}, {
        url: 'http://only.for.android.com/update_location.json', // <-- Android ONLY:  your server url to send locations to
        params: {
            auth_token: "Token ".concat(ProfileService.getUserKey()),    //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
            withCredentials: true,
            Authorization: "Token ".concat(ProfileService.getUserKey())
        },
        headers: {
				'Content-Type': "application/json",
				'Authorization':"Token ".concat(ProfileService.getUserKey())
			},
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
        notificationText: 'ENABLED', // <-- android only, customize the text of the notification
        activityType: 'AutomotiveNavigation',
        debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
    });

bgGeo.start();

$scope.stopBackgroundGeolocation = function () {
	bgGeo.stop()
};
}*/

})