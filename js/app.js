'use strict';

var App = angular.module('angularfire-login-boilerplate', [ 'ngRoute','firebase'
	,'MainCtrl'
	,'BeerCtrl'
	,'UsersCtrl'
	// ,'TastedDirective'
	]);

App.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/main', {templateUrl: 'partials/main.html', controller: 'MainCtrl'});
    $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'MainCtrl'});
    $routeProvider.when('/list', {templateUrl: 'partials/list.html', controller: 'BeerCtrl'});
    $routeProvider.when('/beer/:beerID', {templateUrl: 'partials/beer.html', controller: 'BeerCtrl'});
    $routeProvider.when('/manage', {templateUrl: 'partials/manage.html', controller: 'BeerCtrl'});
    $routeProvider.otherwise({redirectTo: '/main'});
 }]);


App.factory("AuthFactory", function($rootScope, $q, $http, $firebase) {

  var factory = {};
  var helper = {};
  var firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';

  factory.login = function (authClient, email, password) {
  	console.log(authClient, email, password);
  	authClient.login("password", {
  		email: email, //email: "binarygeometry@gmail.com",
  		password: password, //password: "ZhBDxSXSN4JsL9aU",
  		rememberMe: true
	})
  };

  factory.getUsers = function () {
		var usersRef = new Firebase(firebase_url + 'users/');
		var deferred = $q.defer();
		var users;

		// Attach an asynchronous callback to read the data at our posts reference
		usersRef.on('value', function (snapshot) {
		  // console.log(snapshot.val());
		  users = snapshot.val();
		  console.log('userrefon');
		  console.log(users);
		  deferred.resolve(users);
		}, function (errorObject) {
		  console.log('The read failed: ' + errorObject.code);
		  deferred.resolve('no data');
		});

        return deferred.promise;
  };

  factory.getProfile = function (username) {
  		// uid = username.foundByFunction
  		var uid = ''//'simplelogin:69'
		var deferred = $q.defer();
		var profile;
		var username = username;
		console.log(username);
  		factory.getUidByUsername(username).then(function(data){
  			var uid = data;

			var url =  $rootScope.firebase_url + 'users/' + uid;
  			console.log(uid);
			var profileRef = new Firebase(url);
			profileRef.on('value', function (snapshot) {
			  // console.log(snapshot.val());
			  profile = snapshot.val();
			  // console.log('profile');
			  console.log(profile);
			  deferred.resolve(profile);
			}, function (errorObject) {
			  console.log('The read failed: ' + errorObject.code);
			  deferred.resolve('no data');
	  		})
		});

        return deferred.promise;
  };
  factory.getUidByUsername = function(username){
  		var username = username;
  		var url = firebase_url + 'listings/' + username;
  		var listings = new Firebase(url);
  		console.log(url);
  		var deferred = $q.defer();
  		listings.on('value', function(snapshot) {
        		var uid = snapshot.val(); // remember the brackets!!
        		console.log(uid);
          		deferred.resolve('gogo');
        }, function(err){
        	//
        });
        return deferred.promise;


  };
  return factory
});

var MainCtrl = angular.module('MainCtrl',[]);

MainCtrl.controller('MainCtrl', function($rootScope, $scope, $http, $q, $firebase, $location, AuthFactory) {

	$rootScope.firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';
	$scope.registerData = {}
	$scope.loginData = {}
	$scope.newUser = false;

	var firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';
		// Print the current login state whenever it changes
	var ref = new Firebase(firebase_url);

	var authClient = new FirebaseSimpleLogin(ref, function(error, user) {
	  if (error !== null) {
	    console.log("Error authenticating:", error);
	  } else if (user !== null && $scope.newUser) {
	    console.log("New User is logged in:", user);
	    $scope.saveNewUser(user); // save user to firebase
	    $scope.newUser = false; // reset new user flag
	    console.log('should change now');
	    $rootScope.firebaseUser = user;
	    $location.path('/list');
	    console.log('should be changed, might not fire');
	  } else if (user !== null) {
	    console.log("User is logged in:", user);
	    $rootScope.firebaseUser = user;
	    console.log('should change now');
	    $location.path('/list');
	    console.log('should be changed, might not fire');
	  } else {
	    console.log("User is logged out");
	  }
	});
	$scope.change = function(){
		
			    $location.path('/list');
	};
	$scope.login = function(){
		
		var email = $scope.loginData.email;
		var password = $scope.loginData.password;
		AuthFactory.login(authClient);
			    $location.path('/#/list');
	};

	$scope.logout = function(){

		authClient.logout();	
	};

	$scope.register = function(){

		$scope.newUser = true;
		var email = $scope.registerData.email;
		var password = $scope.registerData.password;
		var username = $scope.registerData.username;
		$scope.uniqueUsername(username).then(function(exists){
			if(!exists) {
				console.log('creating new user')
				authClient.createUser(email, password, function(err, user) {
					AuthFactory.login(authClient, email, password);
				});
			} else {
				alert('try to be more original');
			}
		});
	};

	$scope.saveNewUser = function(user){
		var username = $scope.registerData.username;
		ref.child('users').child(user.uid).set({
        	username: username,
        	uid: user.uid
     	});
     	ref.child('listings').child(username).set({
     		uid: user.uid,
        	active: true
     	});
     	console.log('does it end here?');
     	return;
	};

	$scope.uniqueUsername = function(username){
      
        var listings = new Firebase(firebase_url + 'listings');
        var exists = false;
        var deferred = $q.defer();
        listings.child(username).once('value', function(snapshot) {
        		console.log(snapshot.val);
          		exists = (snapshot.val() !== null);
          		console.log(exists);
          		deferred.resolve(exists);
        });
        return deferred.promise;
	};

});

var UsersCtrl = angular.module('UsersCtrl',[]);

UsersCtrl.controller('UsersCtrl', function($rootScope, $scope, $http, $q, $firebase, AuthFactory) {
	
	$scope.users = {};
	$scope.profileData = {};

	$scope.getUsers = function(){
		AuthFactory.getUsers().then(function(data){
			console.log(data);
			$scope.users = data;
		});
	};
	$scope.getUsers();

	$scope.updateProfile = function(){
		var data = $scope.profileData.about|| {};
		var uid = $rootScope.firebaseUser.uid;
		var url =  $rootScope.firebase_url + 'users/' + uid;
		var profile = new Firebase(url);
        console.log(url, data);
        profile.update({profile: data});
	};
	$scope.getProfile = function(username){
		var username = username;
		AuthFactory.getProfile(username).then(function(data){
			console.log(data);
			$scope.profile = data;
		});
		// AuthFactory.getUidByUsername(username).then(function(data){
		// 	console.log(data);
		// 	$scope.profile = data;
		// });
	};
	$scope.getProfile('gogo');


});


