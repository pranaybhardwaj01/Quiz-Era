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
            .state('app', {
                url: '/app',
                templateUrl: '/templates/appMenu.html',
                abstract: true,
                controller: 'quizCtrl',
                controllerAs: 'quiz'
            })

        .state('app.welcome', {
                    url: '/welcome',
                    views: {
                        'menuContent': {
                            templateUrl: '/templates/welcome.html',
                            controller: 'welcomeCtrl',
                            controllerAs: 'welcome'
                        }
                    }
                }

            )
            .state('app.gameHome', {
                    url: '/gameHome',
                    views: {
                        'menuContent': {
                            templateUrl: '/templates/gameHome.html',
                            controller: 'gameSelectCtrl',
                            controllerAs: 'game'

                        }
                    }
                }

            )
            .state('game', {
                url: 'game/play',
                params: { 'genre': null, 'logo': null },
                templateUrl: '/templates/gameScreen.html',
                controller: 'gamePlayCtrl',
                controllerAs: 'play',
                 resolve: {
                    result: function($stateParams, $firebaseArray) {
                        var questionArray = firebase.database().ref('tasks').child($stateParams.genre);
                        return $firebaseArray(questionArray).$loaded();

                    }

                 }


            })
            .state('app.gameWelcome', {
                url: 'app/game/start',
                params: { 'index': null, 'anotherKey': null },
                views: {
                    'menuContent': {
                        templateUrl: '/templates/gameStart.html',
                        controller: 'launchCtrl',
                        controllerAs: 'launch'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })
    .controller("quizCtrl", function($firebaseAuth, userData, $state) {
        var quiz = this;
        var auth = $firebaseAuth();
        quiz.userName = userData.userName;
        quiz.imgURL = userData.img;
        quiz.loginwithgoogle = loginwithgoogle;

        function loginwithgoogle($location) {

            var promise = auth.$signInWithPopup("google");


            promise.then(function(result) {
                    console.log("Signed in as:", result.user.displayName);

                    userData.userName = result.user.displayName;
                    userData.img = result.user.photoURL;

                    $state.go('app.welcome');

                })
                .catch(function(error) {
                    console.error("Authentication failed:", error);
                });
        }
        console.log(userData.userName, userData.img);
    })
    .controller("welcomeCtrl", function(userData, $state) {

        this.displayName = userData.userName;
        this.imageURL = userData.img;
        this.startgame = startgame;


        function startgame() {
            $state.go('app.gameHome');
        }

    })
    .controller("gameSelectCtrl", function($state, $firebaseArray) {
        var game = this;
        var genreArray = firebase.database().ref('lists');
        game.genre = $firebaseArray(genreArray);
        // console.log(game.genre);
        game.click = function(name) {
            console.log(name);
            $state.go('app.gameWelcome', { 'index': name });
        }

    })
    .controller("launchCtrl", function($state, userData, $stateParams) {
        this.userName = userData.userName;
        this.imageUrl = userData.img;
        console.log($stateParams);
        switch ($stateParams.index) {
            case 'friends':
                this.gameLogo = '../img/friendsLogo.jpg'
                this.name = 'FRIENDS'
                break;
            case 'ac':
                this.gameLogo = '../img/assassinLogo.jpg'
                this.name = 'Assassins Creed'
                break;
            case 'hp':
                this.gameLogo = '../img/harryLogo.jpg'
                this.name = 'Harry Potter'
                break;
            case 'cosmos':
                this.gameLogo = '../img/cosmosLogo.jpg'
                this.name = 'Cosmos: A space time Odesseys'
                break;

            default:
                this.name = $stateParams.index;
        }
        this.click = function() {

            //console.log(this.gameLogo);
            $state.go('game', { 'genre': this.name });
        }

    })
.controller('gamePlayCtrl', function($state, userData, $stateParams, result, $interval) {
        var play = this;
        play.score = 0;
        play.logo = $stateParams.logo;
        play.name = $stateParams.genre;
        play.userName = userData.userName;
        play.imgURL = userData.img;
        play.clickStatus = false;
        var op = [];

        function exists(arr, index) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == index) {
                    return true;
                } else {
                    return false;
                }

            }
        }

        play.que = result[Math.floor(Math.random() * result.length)];
        for (var i = 0; i < 4; i++) {
            op.push(play.que.options[i]);
        }
        play.o = op;

        play.clicked = function(option) {
            play.clickStatus = true;
            if (option.status == 'correct') {
                play.score += 10;
            }

            $interval(nextQuestion, 1000, 1);

        }
        var nextQuestion = function() {
            play.clickStatus = false;
            op = [];
            play.que = result[Math.floor(Math.random() * result.length)];

            for (var i = 0; i < 4; i++) {
                op.push(play.que.options[i]);
            }
            play.o = op;
        }



    })