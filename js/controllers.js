var TastedDirective = angular.module('TastedDirective', []);

TastedDirective
.directive( 'tasted', function($rootScope,  $q, TastedFactory) {
    return {
      	restrict: 'AE',
     	replace: true,
      	template: '<input type="checkbox"  ng-model="result" ng-change="tick()" />',
      	controller: 'TastedController',
      	scope: {
       		beer: '@beer',
       		result: '@result'
      	},
      	link: function(scope, elem, attrs) {
      		var beer = scope.beer;
      		// scope.result = 'things';
			// var test = TastedFactory.result(beer);
			TastedFactory.result(beer).then(function(data){
				console.log('then',data);
				scope.result = data;
			});
			// console.log(test);
      	}
    }
})
.controller( 'TastedController', function($rootScope, $scope, $q, $firebase){
	// console.log('beer',$scope.beer);
	$scope.tick = function(){
		var firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';
		var tasted = $scope.result;
		var beerID = $scope.beer;
		var currentUser = $rootScope.firebaseUser.uid;
		var dataObject = { tasted: tasted }; // a mocked out data object   
		console.log('tasted',$scope.result);
		console.log('beer',$scope.result);
		var endpoint = new Firebase(firebase_url + 'tasting/' + currentUser + '/' + beerID);
		var sync = $firebase(endpoint);
		endpoint.set(dataObject);


	}
		// var tasted = tasted;
	// 	console.log(beerID, dataObject, currentUser, endpointUrl);
	// }
});

App.factory("TastedFactory", function($rootScope, $q, $http, $firebase) {

  var factory = {};
  var helper = {};
  var firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';

  factory.result = function (beerID) {
		var currentUser = $rootScope.firebaseUser.uid;
		var endpoint = new Firebase(firebase_url + 'tasting/' + currentUser + '/' + beerID);
		var deferred = $q.defer();
		// console.log(beerID);
				
		endpoint.once('value', function(snapshot){
			// console.log(snapshot.val());
			var foo = snapshot.val() || false;
			if(foo.tasted){
				console.log('tasted');
				deferred.resolve(true);
			} 
			else {
				console.log('not tasted');
				deferred.resolve(false);
			}
			// console.log(beerID);
		});
		
		return deferred.promise;
  };

  return factory;

});


var BeerCtrl = angular.module('BeerCtrl', ['TastedDirective']);

BeerCtrl.controller('BeerCtrl', function($rootScope, $scope, $http, $q, $routeParams, $firebase) {
	$scope.beer = $routeParams.beerID || false;
	$scope.editing = false;
	$scope.beerData = {};
	$scope.ales = 'ales';

	var firebase_url = 'https://brilliant-fire-7870.firebaseio.com/';


		var beersRef       = new Firebase(firebase_url + 'beers/');
		var sync = $firebase(beersRef);
		$scope.beers = sync.$asArray();


		// var syncObject = sync.$asObject();
		// syncObject.$bindTo($scope, 'beers');




	$scope.newBeer = function(){
		var beerObject     = {};
		var beersRef       = new Firebase(firebase_url + 'beers/');
		beerObject.name    = $scope.beerData.name;
		beerObject.brewery = $scope.beerData.brewery;
		beerObject.notes   = $scope.beerData.notes;
		beerObject.abv     = $scope.beerData.abv;
		beerObject.price   = $scope.beerData.price;
		// console.log(beerObject);
		// $scope.messages.$add({text: text});
		// beersRef.push(beerObject);
		$scope.beers.$add(beerObject);
	}
	$scope.showBeer = function(beer){
		if(beer){		
			var beerObject     = {};
			var beersRef       = new Firebase(firebase_url + 'beers/'+ beer);
			beersRef.on("value", function (snapshot) {
				// console.log(snapshot.val());
				$scope.ale = snapshot.val();
				// $scope.$apply();
			});
		}
	}
	$scope.showBeer($scope.beer );

	$scope.beersuiouoi = [
	{
	name:'Stag',  
	brewery:'Cairngorm Brewery',
	notes:'Mahogany coloured with medium to light body, initial bitterness that is balanced by a soft finish from the roasted malts.', 
	abv:'4.1',
	price:'2.50'	     
	},	
	{	
	name:'Wildcat', 
	brewery:'Cairngorm Brewery',
	notes:'A deep amber coloured ale with a complex malty, fruit flavour and delicate bitterness. Strong and distinctive.',
	abv:'5.1',
	price:'2.65'
	},
	{
	name:'Organic Blonde', 
	brewery:'Black Isle',
	notes:'A premium quality continental style lager beer. Pale yellow, with a light biscuit palate and a fresh grassy aroma.',
	abv:'4.5',
	price:'3.05'	
	},
	{
	name:'Porter',
	brewery:'Black Isle',
	notes:'A rich medium dry ruby-black beer. Excellent with oysters and crab or with mature farmhouse cheddar and oatcakes.',
	abv:'4.5',
	price:'3.05'	
	},
	{
	name:'Arran Blonde', 
	brewery:'Arran',
	notes:'Champion Wheat Beer of Britain 2003. Floral hop & new mown grass aroma, citrus fruit with a good hop character. A pale golden beer, clear tasting in a continental style.',
	abv:'5.0',
	price:'2.85'
	},

	{
	name:'Arran Red Squirrel',  
	brewery:'Arran',
	notes:'It is the perfect "session beer" a well balanced malty, hop blend.',
	abv:'3.9',
	price:'2.90'	
	}
	]
});

