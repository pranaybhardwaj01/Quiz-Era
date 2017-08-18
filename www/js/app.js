// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var starter = angular.module('starter', ['ionic'])


starter

    .run(function($ionicPlatform) {
    $ionicPlatform.ready(function($function) {
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
        $ionicPlatform.registerBackButtonAction(function(event) {
            if ($state.current.name == 'game' || $state.current.name == 'endGame')
                event.preventDefault();
            else
                navigator.app.backHistory();
        }, 100);
    });

});

// Ionic uses AngularUI Router which uses the concept of states
// Learn more here: https://github.com/angular-ui/ui-router
// Set up the various states which the app can be in.
// Each state's controller can be found in controllers.js
var timer;
var quizing = angular.module("Quiz", ["firebase", "starter"]);
quizing
    .factory("userData", function() {
        return {};
    })
    .factory("dataService", function() {
        return {};
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('login', {
                url: '/login',

                templateUrl: 'templates/login.html',
                controller: 'quizCtrl',
                controllerAs: 'quiz'

            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'quizCtrl'
            })
            .state('app', {
                url: '/app',
                templateUrl: 'templates/appMenu.html',
                abstract: true,
                controller: 'quizCtrl',
                controllerAs: 'quiz'
            })

        .state('app.welcome', {
                    url: '/welcome',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/welcome.html',
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
                            templateUrl: 'templates/gameHome.html',
                            controller: 'gameSelectCtrl',
                            controllerAs: 'game'

                        }
                    }
                }

            )
            .state('game', {
                url: 'game/play',
                params: { 'genre': null, 'logo': null },
                templateUrl: 'templates/gameScreen.html',
                controller: 'gamePlayCtrl',
                cache: false,
                controllerAs: 'play',
                resolve: {
                    result: function($stateParams, $firebaseArray) {
                        var questionArray = firebase.database().ref('tasks').child($stateParams.genre);
                        return $firebaseArray(questionArray).$loaded();

                    },
                    score: function() {
                        return 90;
                    }

                }


            })
            .state('app.gameWelcome', {
                url: 'app/game/start',
                cache: false,
                params: { 'index': null, 'anotherKey': null },
                views: {
                    'menuContent': {
                        templateUrl: 'templates/gameStart.html',
                        controller: 'launchCtrl',
                        controllerAs: 'launch'
                    }
                }
            })
            .state('endGame', {
                url: 'app/gameover',
                params: { 'score': null, 'genre': null },
                templateUrl: 'templates/lastScreen.html',
                controller: 'endCtrl',
                controllerAs: 'end'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    })
    .controller("quizCtrl", function($firebaseArray, $firebaseAuth, userData, $state) {
        var quiz = this;
        var auth = $firebaseAuth();
        quiz.userName = userData.userName;
        quiz.imgURL = userData.img;
        quiz.loginwithgoogle = loginwithgoogle;
        var userref = firebase.database().ref("Users");
        var users = $firebaseArray(userref);
        quiz.gosignUp = function() {
            $state.go('signup');
        }
        quiz.welcome = function() {
            $state.go('app.welcome');
        }
        quiz.signUp = function() {
            auth.$createUserWithEmailAndPassword(quiz.signUpEmail, quiz.signUpPassword)
                .then(function(firebaseUser) {
                    var flaguser = true;
                    var user = firebase.auth().currentUser;
                    user.updateProfile({
                        displayName: quiz.signUpName,
                        photoURL: "http://thejonathanfoundation.org/portals/0/GenericProfile.png"
                    });
                    var obj = {};
                    obj.name = quiz.signUpName;
                    obj.img = "http://thejonathanfoundation.org/portals/0/GenericProfile.png";
                    obj.email = firebaseUser.email;
                    obj.score = 0;
                    obj.category = "None";
                    for (i = 0; i < users.length; i++) {
                        if (quiz.signUpEmail == users[i].email) {
                            flaguser = false;
                        }
                    }
                    if (flaguser)
                        users.$add(obj);
                    console.log(users);
                    $state.go("login");
                }).catch(function(error) {
                    console.error("Error: ", error);
                });

        }
        quiz.signIn = function() {
            var promise = auth.$signInWithEmailAndPassword(quiz.signInEmail, quiz.signInPassword);
            console.log("signIN");
            promise
                .then(function(firebaseUser) {
                    //  console.log(firebaseUser);
                    userData.userName = firebaseUser.displayName;
                    userData.img = firebaseUser.photoURL;
                    quiz.signInEmail = "";
                    quiz.signInPassword = "";
                    userData.email = firebaseUser.email;
                    //console.log(userData.email);
                    $state.go("app.welcome");
                }).catch(function(error) {
                    quiz.signInPassword = "";
                    switch (error.code) {
                        case "auth/invalid-email":
                            alert("Please Enter correct Email.")

                            break;
                        case "auth/wrong-password":
                            alert("INCORRECT Password,");
                            break;

                        default:
                            alert(error.message);
                            break;
                    }
                });
        }
        quiz.logout = function() {

            firebase.auth().signOut().then(function() {
                $state.go("login")
                alert("logged Out");
            }).catch(function(error) {
                console.log(error);
            });
        }

        function loginwithgoogle($location) {

            window.plugins.googleplus.login({
                    'scopes': 'https://www.googleapis.com/auth/plus.me',
                    'webClientid': '755619707190-ssr3kq812c6jrmn24igtma85cfiagl0p.apps.googleusercontent.com',
                    'offline': true,
                },
                function(user_data) {

                    userData.userName = user_data.displayName;
                    userData.email = user_data.email;
                    userData.img = "http://thejonathanfoundation.org/portals/0/GenericProfile.png";
                    $state.go("app.welcome");

                },
                function(err) { alert(err); }
            )


        }

    })
    .controller("welcomeCtrl", function(userData, $state, $firebaseAuth) {

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
        game.click = function(name, img) {
            $state.go('app.gameWelcome', { 'index': name, 'anotherKey': img });
        }

    })
    .controller("launchCtrl", function($firebaseArray, $state, userData, $stateParams) {
        this.userName = userData.userName;
        this.imageUrl = userData.img;
        console.log($stateParams);
        this.img = $stateParams.anotherKey;
        // console.log(userData);

        this.name = $stateParams.index;
        this.click = function() {
            $state.go('game', { 'genre': this.name });
        }

    })
    .controller('gamePlayCtrl', function($state, userData, $stateParams, $firebaseArray, $interval, score, result) {
        var play = this;
        var count = 0;
        play.score = 0;
        var timer = score;
        var minutes = 0;
        var sec = 0;
        var reset = 1000;
        var userref = firebase.database().ref("Users");
        var users = $firebaseArray(userref);
        var currUser = null;
        users.$loaded().then(function(users) {
            for (var index = 0; index < users.length; index++)
                if (users[index].email == userData.email)
                    currUser = index;
        })

        play.logo = $stateParams.logo;
        play.name = $stateParams.genre;
        play.userName = userData.userName;
        play.imgURL = userData.img;
        play.clickStatus = false;
        var op = [];
        var index = Math.floor(Math.random() * result.length);
        play.que = result[index];
        result.splice(index, 1);
        count++;
        for (var i = 0; i < 4; i++) {
            var k = Math.floor(Math.random() * play.que.options.length);
            var temp = play.que.options[k];
            op.push(play.que.options[k]);
            play.que.options[k] = play.que.options[0];
            play.que.options[0] = temp;
            play.que.options.shift();
        }
        play.o = op;

        play.clicked = function(option) {
            play.clickStatus = true;
            if (option.status == 'correct') {
                play.score += 10;
            }
            if (count < 6)
                $interval(nextQuestion, 1000, 1);

            else
                $interval(function() {
                    $interval.cancel(stop);
                    if (users[currUser].score < score) {
                        users[currUser].score = play.score;
                        users[currUser].category = play.name;
                        users.$save(currUser).then(function(ref) {}, function(err) { alert("No internet connection,Data CANNOT BE SAVED. ") });
                    }
                    $state.go('endGame', { 'score': play.score, 'genre': play.name })
                }, 1000, 1);

        }
        var stop = $interval(function() {
            timer--;
            if (timer >= 60)
                minutes = 1;
            else minutes = 0;
            if (timer % 60 < 10)
                sec = "0" + (timer % 60);
            else
                sec = timer % 60;

            play.time = "0" + minutes + ":" + sec;
            if (timer == 0) {
                $interval.cancel(stop);
                if (users[currUser].score < score) {
                    users[currUser].score = play.score;
                    users[currUser].category = play.name;
                    users.$save(currUser).then(function(ref) {}, function(err) { alert("No internet connection,Data CANNOT BE SAVED. ") });

                }
                $state.go('endGame', { 'score': play.score, 'genre': play.name });

            }
        }, 1000)
        console.log("stop", stop)
        var nextQuestion = function() {
            play.clickStatus = false;
            op = [];
            index = Math.floor(Math.random() * result.length);
            play.que = result[index];
            result.splice(index, 1);
            for (var i = 0; i < 4; i++) {
                var k = Math.floor(Math.random() * play.que.options.length);
                var temp = play.que.options[k];
                op.push(play.que.options[k]);
                play.que.options[k] = play.que.options[0];
                play.que.options[0] = temp;
                play.que.options.shift();
            }
            count++;
            play.o = op;
        }

    })
    .controller('endCtrl', function($stateParams, $state, $firebaseArray) {
        var end = this;
        end.score = $stateParams.score;
        end.genre = $stateParams.genre;
        var userref = firebase.database().ref("Users");
        var users = $firebaseArray(userref);

        end.gameSelect = function() {
            $state.go('app.gameHome');
        }
        end.rematch = function() {
            $state.go('game', { 'genre': end.genre });
        }
    })