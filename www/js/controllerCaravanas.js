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

.controller('ShowMapCtrl',function($scope,$cordovaGeolocation){

	$scope.latitud = 0;
	$scope.longitud = 0;

	var watchOptions = {
		timeout : 5000,
    enableHighAccuracy: false // may cause errors if true
};

var watch = $cordovaGeolocation.watchPosition(watchOptions);
watch.then(
	null,
	function(err) {
      // error
  },
  function(position) {
  	$scope.latitud  = position.coords.latitude;
  	$scope.longitud = position.coords.longitude;
  	console.log("hola");
  });

watch.clearWatch();
})