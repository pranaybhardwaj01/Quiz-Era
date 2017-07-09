angular.module("todoApp",['ngRoute','firebase'])
.config(function($routeProvider){

$routeProvider
    .when("/",{templateUrl:"views/home.html"})
    .when("/list/:listname",{templateUrl:"views/list.html"})
    .otherwise({redirectTo:"/"});




})
.controller("todoCtrl",todoCtrl)
.controller("homeCtrl",homeCtrl)
.factory("lists",lists)
.factory("todolists",todolists)



function lists(){
    return []
}


function todolists(){
    return []
}

function homeCtrl($firebaseArray,todolists, $location){
    var home = this;

   var listRef = firebase.database().ref("lists");
   var lists = $firebaseArray(listRef);


    home.lists= lists ;
   
    home.add = function(listItem){
       home.lists.$add({"name":listItem});
       todolists.push({name:listItem,data:[]})
       console.log(home.lists);
       $location.path("/list/"+listItem)
   }

}

function todoCtrl($routeParams,$firebaseArray){
    var todo = this;

    todo.tasks = [];
    console.log($routeParams);
    todo.name = $routeParams.listname

    var taskRef = firebase.database().ref('tasks').child(todo.name);
    todo.tasks = $firebaseArray(taskRef)

    


    todo.editMode = false;
    var savedIndex =0;

    todo.addTask = addTask;

    function addTask(){
        var obj = {};
        obj.title = todo.task;
        obj.status = false;
        todo.tasks.$add(obj);
        todo.task = "";
        console.log(todo.tasks);
    }

    todo.deleteTask = function(i){
        todo.tasks.splice(i,1);
        console.log(todo.tasks);
    }

    todo.editTask = function(i){
       todo.editMode = true;
       savedIndex = i;
       todo.task = todo.tasks[i].title;
    }

     todo.setStatus = function(i){
      todo.tasks[i].status = !todo.tasks[i].status;
      todo.tasks.$save(i);
      console.log(todo.tasks);
    }


   todo.updateTask = function(){
       todo.editMode = false;
       todo.tasks[savedIndex].title = todo.task
       todo.task = "";

    }




    console.log("todo");

   


}