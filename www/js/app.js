// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var starter = angular.module('starter', ['ionic'])


starter

    .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up the various states which the app can be in.
// Each state's controller can be found in controllers.js
var quizing = angular.module("Quiz", ["firebase", "starter"]);
quizing
    .factory("userData", function() {
        return {};
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('login', {
            url: '/login',

            templateUrl: '/templates/login.html',
            controller: 'quizCtrl'

        })

        .state('welcome', {
            url: '/welcome',

            templateUrl: '/templates/welcome.html',
            controller: 'welcomeCtrl'
        })
        .state('gameHome',{
            url:'/gameHome',
            templateUrl: '/templates/gameHome.html',
            controller: 'gameHomeCtrl'
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })
    .controller("quizCtrl", function($firebaseAuth, userData, $state) {
        var quiz = this;
        var auth = $firebaseAuth();
        quiz.loginwithgoogle = loginwithgoogle;

        function loginwithgoogle($location) {

            var promise = auth.$signInWithPopup("google");


            promise.then(function(result) {
                    console.log("Signed in as:", result.user.displayName);
                    quiz.user = result.user
                    userData.userName = result.user.displayName;
                    userData.img = result.user.photoURL;
                    console.log(result);
                    $state.go('welcome');

                })
                .catch(function(error) {
                    console.error("Authentication failed:", error);
                });
        }
    })
    .controller("welcomeCtrl", function(userData,$state) {
        this.displayName = userData.userName;
        this.imageURL = userData.img;
        this.startgame=startgame;
        function startgame(){  
         $state.go('gameHome');  
        }

    })