'use strict';

angular.module('myEditorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'btford.socket-io',
  'ui.bootstrap',
  'summernote',
  'ui.ace',
  'ui.multiselect',
  "firebase"
])
  .config(["$routeProvider", "$locationProvider", "$httpProvider", function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  }])

  .factory('authInterceptor', ["$rootScope", "$q", "$cookieStore", "$location", function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }])

  .run(["$rootScope", "$location", "Auth", function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  }]);
'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  }]);
'use strict';

angular.module('myEditorApp')
  .controller('LoginCtrl', ["$scope", "Auth", "$location", function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  }]);

'use strict';

angular.module('myEditorApp')
  .controller('SettingsCtrl', ["$scope", "User", "Auth", "$location", function ($scope, User, Auth,$location) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
          $location.path('/');
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('SignupCtrl', ["$scope", "Auth", "$location", function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Account created, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

  }]);

'use strict';

angular.module('myEditorApp')
    .controller('AddchallengeCtrl', ["$http", "$location", "$scope", "Auth", "$routeParams", function($http, $location, $scope, Auth, $routeParams) {
        $scope.problems = [];
        Auth.isLoggedInAsync(function() {
          $scope.friends = Auth.getCurrentUser().friends;
        });
        $scope.selectedFriends = [];
        $scope.hasId = typeof $routeParams.id !== 'undefined';
        if (!$scope.hasId) {
            $http.get('api/problems').success(function(problems) {
                $scope.problems = problems;
            });
        }

        $scope.timeLength = '';
        $scope.selectedProblem = {};

        $scope.modes = ['java', 'c_cpp'];
        $scope.code = {
          run:{
            'java':'',
            'c_cpp':''
          },
          solution:{
            'java':'',
            'c_cpp':''
          },
          currentMode: 'java'
        };

        $scope.save = function() {
            var friends = $scope.selectedFriends;
            var problem;
            if (!$scope.hasId) {
                problem = $scope.selectedProblem._id;
            } else {
                problem = $routeParams.id;
            }

            var people = [];
            console.log("Friends", friends);
            _(friends).forEach(function(friend) {
                people.push({user:friend._id,solution:$scope.code.solution});
            });

            $http.post('api/challenges', {
                owner: Auth.getCurrentUser()._id,
                problem: problem,
                people: people,
                run:$scope.code.run,
                duration: parseInt($scope.timeLength)
            }).success(function() {
                $location.path('/home');
            });
        };

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode('ace/mode/' + $scope.code.currentMode.toLowerCase());
                    console.log('CHANGED!!!');
                    // Also have to change the code content
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                  console.log('CHANGED!!!');
                    _ace.getSession().setMode('ace/mode/' + $scope.code.currentMode.toLowerCase());
                    // Also have to change the tests content
                };
            }
        };
    }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/addChallenge', {
        templateUrl: 'app/addChallenge/addChallenge.html',
        controller: 'AddchallengeCtrl'
      }).when('/addChallenge/:id', {
        templateUrl: 'app/addChallenge/addChallenge.html',
        controller: 'AddchallengeCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
    .controller('AddproblemCtrl', ["Auth", "$http", "$scope", function(Auth, $http, $scope) {
        $scope.description = '';
        $scope.title = '';
        $scope.feedback = false;

        $scope.addProblem = function() {
            $http.post('/api/problems', {
                title: $scope.title,
                description: $scope.description,
                'owner_id': Auth.getCurrentUser()._id,
                solution:{
                  java:'',
                  javascript:'',
                  cpp:'',
                  python:''
                },
                tests:''
            })
                .success(function() {
                    $scope.userForm.title.$setPristine();
                    $scope.userForm.content.$setPristine();
                    $scope.description = '';
                    $scope.title = '';
                    $scope.feedback = true;
                })
                .error(function(data, status) {
                    console.log(data);
                    console.log(status);
                });

        };
    }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/addProblem', {
        templateUrl: 'app/addProblem/addProblem.html',
        controller: 'AddproblemCtrl',
        authenticate: true
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('AdminCtrl', ["$scope", "$http", "Auth", "User", function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  }]);
'use strict';

angular.module('myEditorApp')
    .controller('CCtrl', ["$scope", "$http", "$routeParams", "Auth", function($scope, $http, $routeParams, Auth) {

      $scope.modes=['java', 'c_cpp', 'javascript'];

      $scope.code = {
        solution:{
          'java':'helo'
        },
        currentMode:'java'
      };

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                    console.log('CHANGED!!!');
                    // Also have to change the code content
                };
            }
        };

        $http.get('/api/challenges/' + $routeParams.id).success(function(challenge) {
            $scope.challenge = challenge;
            console.log(challenge);
            $http.get('api/problems/' + challenge.problem).success(function(problem) {
                $scope.problem = problem;
                var user = _.find(challenge.people, function(person) {
                    return person.user === Auth.getCurrentUser()._id;
                });
                $scope.code.solution = user.solution;
            });
        });
    }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/c/:id', {
        templateUrl: 'app/c/c.html',
        controller: 'CCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('CollaborateCtrl', ["$scope", "$http", "$routeParams", "Auth", function ($scope,$http,$routeParams,Auth) {
     $scope.modes = ['javascript', 'java', 'c_cpp', 'python'];
        $scope.code = {
            content: '',
            currentMode: 'javascript'
        };
        $scope.tests = {
            content: '',
            currentMode: 'javascript'
        };
        $scope.problem = {};
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            console.log($routeParams.id);
            $scope.problem = problem;
        });

        $scope.beenTested = false;
        $scope.testResult = '';

        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {
              var fireRef = new Firebase('my-editor.firebaseio.com/collaborate/'+$routeParams.sId);
              Auth.isLoggedInAsync(function(){
                    var firepad = Firepad.fromACE(fireRef, _ace,{userId:Auth.getCurrentUser().name});
                  console.log('outside');
                  fireRef.on('value',function(dataSnapshot){
                  console.log('inside',dataSnapshot);
                   var temp = [];
                   dataSnapshot.child('users').forEach(function(d){
                     temp.push(d.name());
                   });
                   $scope.userList = temp;
                   _.defer(function(){$scope.$apply()});
                });
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                };
              })

            }
        };
  }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/collaborate/:id/session/:sId', {
        templateUrl: 'app/collaborate/collaborate.html',
        controller: 'CollaborateCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('EditCtrl', ["$scope", "$http", "$routeParams", "$modal", "$location", function ($scope,$http,$routeParams,$modal,$location) {
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.problem = {};
        //first thing being executed
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
        });

        $scope.save = function() {
           // $scope.problem.tests = $scope.tests.content;
            $http({
                method: 'PUT',
                url: '/api/problems/' + $scope.problem._id,
                data: $scope.problem
            }).
            success(function(data, status, headers, config) {
                var modalInstance = $modal.open({
                    templateUrl: '/app/p/modal.html',
                    size: 'md',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function(a) {
                    console.log(a);
                });
            }).
            error(function(data, status, headers, config) {
                console.log("error, son...");
            });
        };


    }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/edit/:id', {
        templateUrl: 'app/edit/edit.html',
        controller: 'EditCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('FriendsCtrl', ["$scope", "Auth", "socket", "$location", function ($scope,Auth,socket,$location) {
  // $http.get('/api/users/me').success(function(u) {
  //     $scope.me = u;
  //     socket.syncUpdates('user', [$scope.me]);
  //   });
  //socket.syncUpdates('User',[$scope]);
  $scope.delete = function(id) {
    Auth.deleteFriend(id);
    $scope.u = Auth.getCurrentUser();
  }
 $scope.u = Auth.getCurrentUser();
  $scope.query ={};
  $scope.submit = function(pattern){
    $location.path('/search_user/'+$scope.query.pattern);
  }

  }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/friends', {
        templateUrl: 'app/friends/friends.html',
        controller: 'FriendsCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
    .controller('HomeCtrl', ["socket", "$http", "$scope", "Auth", "$modal", "$location", "$timeout", function(socket, $http, $scope, Auth, $modal, $location, $timeout) {
        $scope.problems = [];
        $scope.myChallenges = [];
        $scope.participatingChallenges = [];
        $scope.timers = [];

        var myChallenges = [];
        var participatingChallenges = [];
        $scope.edit = function(problem){
            $location.path('/edit/'+problem._id);
        }

        $scope.isMyProblem = function(problem){
            return problem.owner_id === Auth.getCurrentUser()._id;
        };

        var checkIfFinished = function(challenges){
          _(challenges).each(function(c){
                    _(c.people).each(function(p){
                      if (p.hasStarted && !p.hasFinished){
                        var now = new Date();
                        var started = new Date(p.timeStartedChallenge);
                        var elapsed = now - started;
                        if(elapsed > c.duration * 60000){
                          p.hasFinished = true;
                        }
                      }
                    });
                });
        };

        $http.get('/api/problems/').success(function(problems) {
            $scope.problems = problems;
            socket.syncUpdates('problem', $scope.problems);

            $http.get('api/challenges/').success(function(c) {
                $scope.myChallenges = c.myChallenges;
                checkIfFinished($scope.myChallenges);
                //socket.syncUpdates('challenge', $scope.myChallenges);
                $scope.participatingChallenges = c.participatingChallenges;
                checkIfFinished($scope.participatingChallenges);
                socket.syncUpdatesChallenge(Auth.getCurrentUser(),$scope.myChallenges,$scope.participatingChallenges);
            });
        });

        $scope.open = function(problem) {
            var modalInstance = $modal.open({
                templateUrl: 'components/popup/popup.html',
                controller: 'PopupCtrl',
                resolve: {
                    variable: function() {
                        return problem._id;
                    }
                }
            });
        };
        $scope.deleteProblem = function(problem) {
            $http.delete('api/problems/' + problem._id).success(function() {
                _($scope.challenges).where({
                    problem_id: problem._id
                }).forEach(function(challenge) {
                    $http.delete('api/challenges/' + challenge.id);
                });
            });
            //make a ui-bootstrap modal later to ask if really wanna delete problem.
        };

        $scope.challenge = function(problem) {
            $location.path('/addChallenge/' + problem._id);
        };

        $scope.takeChallenge = function(challenge) {
            _(challenge.people).each(function(person) {
                if (!person.hasStarted) {
                    if (person.user._id === Auth.getCurrentUser()._id) {
                        person.hasStarted = true;
                        person.timeStartedChallenge = new Date();
                        $http.put('api/challenges/' + challenge._id, person).success(function(data) {
                            $location.path('/c/' + challenge._id);
                        });
                    }
                } else {
                    if (person.user._id === Auth.getCurrentUser()._id) {
                        var now = new Date();
                        var limitDate = new Date(person.timeStartedChallenge);
                        limitDate.setSeconds(now.getSeconds() + challenge.duration * 60);
                        if (now < limitDate) {
                            $location.path('/c/' + challenge._id);
                        } else {
                            if (!person.hasFinished) {
                                person.hasFinished = true;
                                $http.put('api/challenges/' + challenge._id, person).success(function(data) {
                                    $location.path('/home'); //refresh not working?
                                });
                            }
                        }
                    }
                }
            });

            // $location.path('/c/' + challenge.challengeData._id);
        };

        $scope.$on('$destroy', function() {
            socket.unsyncUpdates('problem');
        });
    }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/home', {
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl',
        authenticate: true
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('MainCtrl', ["$scope", "$http", "socket", function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  }]);
'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  }]);
'use strict';

angular.module('myEditorApp')
    .controller('PCtrl', ["$scope", "$routeParams", "$http", "$modal", function($scope, $routeParams, $http, $modal) {
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.modes = ['java','c_cpp'];
        $scope.code = {
          run:{
            'java':'',
            'c_cpp':''
          },
          solution:{
            'java':'',
            'c_cpp':''
          }
        };
        $scope.currentMode = 'java'
        $scope.problem = {};
        //first thing being executed
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
            if (problem.solution) {
                $scope.code.solution.java = problem.solution.java; //the first one.
                $scope.code.solution.c_cpp = problem.solution.c_cpp;
            }
            if (problem.run) {
                $scope.code.run.java = problem.run.java;
                $scope.code.run.c_cpp = problem.run.c_cpp;
            }
        });

        $scope.run = function() {
          $http({
              method: 'POST',
              url: 'http://54.88.184.168/run',
              data: $scope.problem
          }).success(function(data){
               $scope.output = data;
          });
        };
        $scope.save = function() {
           //$scope.problem.solution[$scope.code.currentMode] = $scope.code.content;
            //$scope.problem.tests = $scope.tests.content;
            $scope.problem.run = $scope.code.run;
            $scope.problem.solution = $scope.code.solution;
            $http({
                method: 'PUT',
                url: '/api/problems/' + $scope.problem._id,
                data: $scope.problem
            }).
            success(function(data, status, headers, config) {
                var modalInstance = $modal.open({
                    templateUrl: '/app/p/modal.html',
                    size: 'md',
                    controller: ModalInstanceCtrl
                });
                modalInstance.result.then(function(a) {
                    console.log(a);
                });
            }).
            error(function(data, status, headers, config) {
                console.log("error, son...");
            });
        };

        $scope.codeOptions = {
            mode: $scope.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.currentMode.toLowerCase());
                    // Also have to change the code content
                };
            }
        };

        $scope.testsOptions = {
            mode: $scope.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.testsModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.currentMode.toLowerCase());
                    // Also have to change the tests content
                };
            }
        };
    }]);

var ModalInstanceCtrl = ["$scope", "$modalInstance", "$location", function($scope, $modalInstance,$location) {
    $scope.ok = function() {
        $modalInstance.close('user clicked ok');
         $location.path('/home');
    };
}];

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/p/:id', {
        templateUrl: 'app/p/p.html',
        controller: 'PCtrl',
        authenticate:true
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('ProfileCtrl', ["$scope", "$routeParams", "$http", "Auth", "$modal", function ($scope, $routeParams, $http,Auth , $modal) {
 function getExampleRef(a) {
           var ref = new Firebase(a);
           var hash = window.location.hash.replace(/#/g, '');
           if (hash) {
              ref = ref.child(hash);
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.name(); // add it as a hash to the URL.
      }
      if (typeof console !== 'undefined')
        console.log('Firebase data: ', ref.toString());
      return ref;
    }
        $scope.modes = ['javascript', 'java', 'c_cpp', 'python'];
        $scope.code = {
            content: 'Helloooo',
            currentMode: 'javascript'
        };
        $scope.tests = {
            content: 'World',
            currentMode: 'javascript'
        };
        $scope.problem = {};
        $http.get('/api/problems/' + $routeParams.id).success(function(problem) {
            $scope.problem = problem;
        });
        $scope.userList = [];
        $scope.beenTested = false;
        $scope.testResult = '';
        $scope.fireRef  = new Firebase('my-editor.firebaseio.com/TEST/4/');
        $scope.codeOptions = {
            mode: $scope.code.currentMode,
            onLoad: function(_ace) {

                // HACK to have the ace instance in the scope...
               var firepad = Firepad.fromACE($scope.fireRef, _ace,{userId:Auth.getCurrentUser().name});

               $scope.fireRef.on('value',function(dataSnapshot){
                   var temp = [];
                   dataSnapshot.child('users').forEach(function(d){
                     temp.push(d.name());
                   });
                   $scope.userList = temp;
                  _.defer(function(){$scope.$apply();});
                });

                $scope.codeModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.code.currentMode.toLowerCase());
                };
            }
        };
        $scope.open = function() {
          var modalInstance = $modal.open({
            templateUrl: 'components/popup/popup.html',
            controller: 'PopupCtrl',
            resolve: {
              variebl: function () {
                return $scope.items;
              }
            }
          });
        };

        $scope.testsOptions = {
            mode: $scope.tests.currentMode,
            onLoad: function(_ace) {
                // HACK to have the ace instance in the scope...
                $scope.testsModeChanged = function() {
                    _ace.getSession().setMode("ace/mode/" + $scope.tests.currentMode.toLowerCase());
                };
            }
        };
  }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/profile', {
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .controller('SearchUserCtrl', ["$http", "$scope", "$routeParams", "Auth", "socket", function ($http,$scope,$routeParams,Auth,socket) {
    $scope.message = [];
    $scope.submitted = false;
      $scope.add = function(id, $index) {
          Auth.addRequest(id,function(data){
             if(data.message === 'added') {
                $scope.message[$index] = true;
                $scope.submitted = true;
             }
             socket.socket.emit('request',id);
          });

      }
      $http.get('/api/users/search/'+$routeParams.pattern).success(function(docs){
          $scope.docs = docs;
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/search_user/:pattern', {
        templateUrl: 'app/search_user/search_user.html',
        controller: 'SearchUserCtrl'
      });
  }]);

'use strict';

angular.module('myEditorApp')
  .factory('Auth', ["$location", "$rootScope", "$http", "User", "$cookieStore", "$q", function Auth($location, $rootScope, $http, User, $cookieStore, $q) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },
       addRequest:function(_id,callback) {
          var cb = callback || angular.noop;
          User.friendReq({_id:_id},function(data){
            return cb(data);
          });
       },

       ignoreRequest: function(id){
          User.ignoreReq({id:id});
       },

       ignoreColla: function(id){
          User.ignoreColla({id:id});
       },
      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

    deleteFriend: function(id){
        User.deleteFriend({id:id});
    },
      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      addFriend:function(id){
          User.addFriend({_id:id});
      },
      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      }
    };
  }]);

'use strict';

angular.module('myEditorApp')
  .factory('User', ["$resource", function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      friendReq:{
        method:'PUT',
        params:{
          controller:'request'
        }
      },
      ignoreColla:{
        method:'DELETE',
        params: {
          controller:'collaborate'
        }
      },
      ignoreReq:{
        method:'DELETE',
        params: {
          controller:'request'
        }
      },
      deleteFriend:{
        method: 'DELETE',
        params:{
          controller:'friend'
        }
      },
      addFriend: {
        method:'PUT',
        params:{
          controller:'add'
        }
      },
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  }]);

'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('myEditorApp')
  .directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  });
'use strict';

angular.module('myEditorApp')
  .controller('NavbarCtrl', ["$scope", "$location", "Auth", "socket", function ($scope, $location, Auth,socket) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/home'
    }];

    $scope.add = function(id){
        Auth.addFriend(id);
    }
    $scope.ignore = function(id) {
        Auth.ignoreRequest(id);
    }
    $scope.acceptColla = function(i){
       $location.path('/collaborate/' + i.problem+'/session/' +  i.content);
    }

    $scope.ignoreColla = function(i){
        Auth.ignoreColla(i._id);
    }
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.user = Auth.getCurrentUser();
     socket.socket.emit('info',$scope.user._id);
     socket.socket.on('news',function(){
      $scope.news = true;
     });
    socket.syncUpdateUser($scope.user);
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  }]);
'use strict';

angular.module('myEditorApp')
  .controller('PopupCtrl', ["$scope", "Auth", "$modalInstance", "$location", "variable", "$http", "socket", function ($scope,Auth,$modalInstance,$location,variable,$http,socket) {
    $scope.u = Auth.getCurrentUser();
    $scope.ok = function () {
       var baseRef = new Firebase('my-editor.firebaseio.com/collaborate/');
       var childRef = baseRef.push();
       var temp =$scope.o.selectedFriends.map(function(i){
            return i._id;
       });
       $http.put('/api/users/collaborate/' + variable + '/problem/' + childRef.name() + '/session',{data:temp}).success(function(){
         $scope.o.selectedFriends.forEach(function(d){
            socket.socket.emit('request',d._id);
         });
        $location.path('/collaborate/' + variable+'/session/' +  childRef.name());
         $modalInstance.close();
       });
       //
      //
    };
    $scope.o={selectedFriends:[]};
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }]);

/* global io */
'use strict';

angular.module('myEditorApp')
  .factory('socket', ["socketFactory", function(socketFactory) {
    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io(null, {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
    });

    var socket = socketFactory({
      ioSocket: ioSocket
    });

    return {
      socket: socket,
      syncUpdatesChallenge:function(user,myChallenges,participatingChallenges){
           socket.on('challenge:save',function(cha){
              if(cha.owner._id == user._id) {
                myChallenges.forEach(function(m){
                    if(m._id == cha._id) {
                      m.people = cha.people;
                    }
                });
              }
              cha.people.forEach(function(u){
                  if(u.user._id == user._id){
                     participatingChallenges.push(cha);
                  }
              })
        });
      },
      syncUpdateUser: function(user){
        socket.on('user:save',function(item){
            if(item._id === user._id) {
              user.friends = item.friends;
              user.request_friends = item.request_friends;
              user.message = item.message;
            }
        });

      },
      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates: function (modelName, array, cb) {
        cb = cb || angular.noop;

        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var oldItem = _.find(array, {_id: item._id});
          var index = array.indexOf(oldItem);
          var event = 'created';

          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            array.splice(index, 1, item);
            event = 'updated';
          } else {
            array.push(item);
          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';
          _.remove(array, {_id: item._id});
          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates: function (modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  }]);
angular.module('myEditorApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/account/login/login.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Login</h1><p>Accounts are reset on server restart from <code>server/config/seed.js</code>. Default account is <code>test@test.com</code> / <code>test</code></p><p>Admin account is <code>admin@admin.com</code> / <code>admin</code></p></div><div class=col-sm-12><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Email</label><input type=email name=email class=form-control ng-model=user.email required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class=\"form-group has-error\"><p class=help-block ng-show=\"form.email.$error.required && form.password.$error.required && submitted\">Please enter your email and password.</p><p class=help-block ng-show=\"form.email.$error.email && submitted\">Please enter a valid email.</p><p class=help-block>{{ errors.other }}</p></div><div><button class=\"btn btn-inverse btn-lg btn-login\" type=submit>Login</button> <a class=\"btn btn-default btn-lg btn-register\" href=/signup>Register</a></div></form></div></div><hr></div>"
  );


  $templateCache.put('app/account/settings/settings.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)\">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class=\"btn btn-lg btn-primary\" type=submit>Save changes</button></form></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class=\"{ 'has-success': form.name.$valid && submitted,\n" +
    "                                            'has-error': form.name.$invalid && submitted }\"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show=\"form.name.$error.required && submitted\">A name is required</p></div><div class=form-group ng-class=\"{ 'has-success': form.email.$valid && submitted,\n" +
    "                                            'has-error': form.email.$invalid && submitted }\"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show=\"form.email.$error.email && submitted\">Doesn't look like a valid email.</p><p class=help-block ng-show=\"form.email.$error.required && submitted\">What's your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class=\"{ 'has-success': form.password.$valid && submitted,\n" +
    "                                            'has-error': form.password.$invalid && submitted }\"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show=\"(form.password.$error.minlength || form.password.$error.required) && submitted\">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class=\"btn btn-inverse btn-lg btn-login\" type=submit>Sign up</button> <a class=\"btn btn-default btn-lg btn-register\" href=/login>Login</a></div></form></div></div><hr></div>"
  );


  $templateCache.put('app/addChallenge/addChallenge.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h1>Create a challenge!</h1></div></div><div class=\"well spacer\"><div class=row><div class=\"form-group col-xs-12 col-sm-12 col-md-12 col-lg-12\"><label for=selectedFriends>Who is taking the challenge?</label><br><multiselect id=selectedFriends class=input-xlarge multiple ng-model=selectedFriends options=\"f.name for f in friends\"></multiselect></div></div><div ng-hide={{hasId}} class=row><div class=\"form-group col-xs-5 col-sm-5 col-md-5 col-lg-5\"><label for=problemSelector>What problem do you want to challenge your friends?</label><select id=problemSelector class=form-control ng-model=selectedProblem ng-options=\"problem.title for problem in problems\"><option value=\"\" selected>--</option></select></div></div><div class=row><div class=\"form-group col-xs-3 col-sm-3 col-md-3 col-lg-3\"><label for=duration>Duration</label><input placeholder=min id=duration class=form-control ng-model=timeLength></div></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Code</h4><select style=margin-bottom:15px class=form-control ng-model=code.currentMode ng-options=\"mode for mode in modes\" ng-change=codeModeChanged()></select><tabset><tab heading=Solution><div class=ace-editor ui-ace=codeOptions ng-model=code.solution[code.currentMode]></div></tab><tab heading=Run><div class=ace-editor ui-ace=testsOptions ng-model=code.run[code.currentMode]></div></tab></tabset></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><p><button ng-click=save() class=\"spacer btn btn-danger\">Challenge!</button></p></div></div></div><!-- <script type=\"text/javascript\" src=\"/js/addProblem.js\"></script> -->"
  );


  $templateCache.put('app/addProblem/addProblem.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><form ng-class=\"{ 'has-error' : userForm.title.$invalid && !userForm.title.$pristine }\" name=userForm novalidate><h2>Title</h2><hr><input class=form-control style=margin-bottom:15px id=title name=title placeholder=\"Put title here\" ng-model=title required><div class=\"alert alert-danger\" ng-show=\"userForm.title.$invalid && !userForm.title.$pristine\" role=alert>title is required!</div><h2>Description</h2><hr><summernote name=content ng-model=description height=300 required></summernote><div class=\"alert alert-danger\" ng-show=\"userForm.content.$invalid && !userForm.content.$pristine\" role=alert>content is required!</div><button ng-disabled=userForm.$invalid ng-click=addProblem() style=\"margin:15px 0 15px 0\" type=button id=sendProblem class=\"btn btn-info\">Save Problem</button><div><div ng-show=feedback class=\"alert alert-success\" role=alert>Problem saved! Click <a href=/home class=alert-link>here</a> to check your problems!</div></div></form></div></div></div><!-- <script type=\"text/javascript\" src=\"/js/addProblem.js\"></script> -->"
  );


  $templateCache.put('app/admin/admin.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><p>The delete user and user index api routes are restricted to users with the 'admin' role.</p><ul class=list-group><li class=list-group-item ng-repeat=\"user in users\"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span> <a ng-click=delete(user) class=trash><span class=\"glyphicon glyphicon-trash pull-right\"></span></a></li></ul></div>"
  );


  $templateCache.put('app/c/c.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><style>.ace_editor { height: 150px; font-size: 15px;}</style><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h1>{{problem.title}}</h1><hr><div ng-bind-html=problem.description></div><hr></div><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Code</h4><select style=margin-bottom:15px class=form-control ng-model=code.currentMode ng-options=\"mode for mode in modes\" ng-change=codeModeChanged()></select><tabset><tab heading=Solution><div class=ace-editor ui-ace=codeOptions ng-model=code.solution[code.currentMode]></div></tab></tabset></div></div><div class=row style=margin-bottom:15px><div class=\"spacer col-xs-12 col-sm-12 col-md-12 col-lg-12\"><button id=test-btn type=button class=\"btn btn-default\">Run & Test</button> <button ng-click=save() type=button class=\"btn btn-success\">Save</button><div id=myspin></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div id=result class=\"alert alert-success\" role=alert></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div class=progress><div class=\"progress-bar progress-bar-success\"></div><div class=\"progress-bar progress-bar-danger\"></div></div></div></div><br><br></div>"
  );


  $templateCache.put('app/collaborate/collaborate.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><style>.ace_editor { height: 300px; font-size: 15px;}</style><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h1>{{problem.title}}</h1><hr><div ng-bind-html=problem.description></div><hr></div><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Code</h4><select style=margin-bottom:15px class=form-control ng-model=code.currentMode ng-options=\"mode for mode in modes\" ng-change=codeModeChanged()></select><div class=col-md-1 style=background-color:#FFE11A;padding-left:0><div><h5 style=margin:0;color:#EA2E49>Online</h5></div><hr style=margin:0;border-top-color:#EA2E49><div ng-repeat=\"o in userList\"><i style=color:#3D4C53 class=\"glyphicon glyphicon-eye-open\"></i> <span style=color:#0CDBE8>{{o}}</span></div></div><!-- <div class='col-xs-11 col-sm-11 col-md-11 col-lg-11' ui-ace=\"codeOptions\" ng-model=\"code.content\"></div> --><tabset class=\"col-xs-11 col-sm-11 col-md-11 col-lg-11\"><tab heading=Solution disabled></tab><tab heading=Run active=true><div ui-ace=codeOptions ng-model=tests.content></div></tab></tabset></div></div><div class=row style=margin-bottom:15px><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div><div class=\"col-xs-11 col-sm-11 col-md-11 col-lg-11\"><button id=test-btn type=button class=\"btn btn-default\">Run & Test</button> <button id=save-btn type=button class=\"btn btn-success\">Save</button><div id=myspin></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div id=result class=\"alert alert-success\" role=alert></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div class=progress><div class=\"progress-bar progress-bar-success\"></div><div class=\"progress-bar progress-bar-danger\"></div></div></div></div><br><br></div>"
  );


  $templateCache.put('app/edit/edit.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><form ng-class=\"{ 'has-error' : userForm.title.$invalid && !userForm.title.$pristine }\" name=userForm novalidate><h2>Title</h2><hr><input class=form-control style=margin-bottom:15px id=title name=title placeholder=\"Put title here\" ng-model=problem.title required><div class=\"alert alert-danger\" ng-show=\"userForm.title.$invalid && !userForm.title.$pristine\" role=alert>title is required!</div><h2>Description</h2><hr><summernote name=content ng-model=problem.description height=300 required></summernote><div class=\"alert alert-danger\" ng-show=\"userForm.content.$invalid && !userForm.content.$pristine\" role=alert>content is required!</div><button ng-disabled=userForm.$invalid ng-click=save() style=\"margin:15px 0 15px 0\" type=button id=sendProblem class=\"btn btn-info\">Save Problem</button><div><div ng-show=feedback class=\"alert alert-success\" role=alert>Problem saved! Click <a href=/home class=alert-link>here</a> to check your problems!</div></div></form></div></div></div><!-- <script type=\"text/javascript\" src=\"/js/addProblem.js\"></script> -->"
  );


  $templateCache.put('app/friends/friends.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><form class=form-inline role=form ng-submit=submit()><div class=form-group><div class=input-group><div class=input-group-addon><i class=\"glyphicon glyphicon-user\"></i></div><input ng-model=query.pattern class=form-control name=username placeholder=\"Enter username\"></div></div><button type=submit class=\"btn btn-success qt3\"><i class=\"glyphicon glyphicon-search\"><span>search</span></i></button></form><br><br><table class=\"table table-hover\" id=friend_list><tr ng-repeat=\"friend in u.friends\"><td class=\"tq3 text-center\">{{friend.name}}</td><td class=tq4>{{friend.email}}</td><td class=tq5><button ng-click=delete(friend._id) class=\"btn btn-danger\"><i class=\"glyphicon glyphicon-remove-circle\"><span>remove</span></i></button></td></tr></table></div>"
  );


  $templateCache.put('app/home/home.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div><div class=\"well spacer col-xs-10 col-sm-10 col-md-10 col-lg-10\"><h3>Problems</h3><hr><p ng-repeat=\"t in timers\">{{t}}</p><p ng-if=\"problems.length === 0\">Hmm, it seems you don't have any problems yet. Wanna <a ng-href=/addProblem>add a problem</a> to your collection?</p><table class=\"table table-hover\" ng-if=\"problems.length !== 0\"><thead><tr><th>Name</th><th>Date added</th><th>Views</th><th>Options</th></tr></thead><tbody><tr ng-repeat=\"problem in problems\" ng-show=isMyProblem(problem)><td><a ng-href=/p/{{problem._id}}>{{problem.title}}</a></td><td>{{problem.date | date: 'shortDate'}}</td><td>N/A</td><td><a popover=delete popover-trigger=mouseenter ng-click=deleteProblem(problem)><i class=\"glyphicon glyphicon-trash\"></i></a> <a popover=edit popover-trigger=mouseenter ng-click=edit(problem)><i class=\"glyphicon glyphicon-edit\"></i></a> <a popover=challenge popover-trigger=mouseenter ng-click=challenge(problem)><i class=\"glyphicon glyphicon-fire\"></i></a> <a popover=collaborate popover-trigger=mouseenter ng-click=open(problem)><i class=\"glyphicon glyphicon-retweet\"></i></a></td></tr><!-- data goes here --></tbody></table></div></div><div class=row><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div><div class=\"well col-xs-10 col-sm-10 col-md-10 col-lg-10\"><h3>Challenges</h3><hr><div class=\"col-xs-12 col-sm-12 col-md-6 col-lg-6\"><div class=\"panel panel-info\"><div class=panel-heading><h5>I've created:</h5></div><div class=panel-body><p ng-show=\"myChallenges.length === 0\">You didn't challenge anyone, yet. Wanna do it right now?</p><accordion close-others=true><accordion-group ng-repeat=\"challenge in myChallenges\" heading={{challenge.problem.title}}><table class=\"table table-hover\"><thead><tr><th>Applicants</th><th>Status</th><th>Score</th></tr></thead><tbody><tr ng-repeat=\"person in challenge.people\"><td>{{person.user.name}}</td><!-- <td>{{challenge.challengeData.people[$index]}}</td> --><td><span ng-hide={{person.hasStarted}} class=\"label label-warning\">Pending</span> <span ng-show=\"{{person.hasStarted}} && {{!person.hasFinished}}\" class=\"label label-info\">Started</span> <span ng-show={{person.gotItRight}} class=\"label label-success\">Right</span> <span ng-show={{person.hasFinished}} class=\"label label-default\">Finished</span> <span ng-hide=\"{{person.gotItRight}} || {{!person.hasFinished}}\" class=\"label label-danger\">Wrong</span></td><td><div><progressbar value=55></progressbar></div></td></tr></tbody></table></accordion-group></accordion></div></div></div><div class=\"col-xs-12 col-sm-12 col-md-6 col-lg-6\"><div class=\"panel panel-info\"><div class=panel-heading><h5>I'm participating:</h5></div><div class=panel-body><p ng-show=\"participatingChallenges.length === 0\">No one challenged you, yet!</p><accordion close-others=true><accordion-group ng-repeat=\"participatingChallenge in participatingChallenges\" heading={{participatingChallenge.problem.title}}><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><button ng-hide=participatingChallenge.hasFinished ng-class={disabled:participatingChallenge.hasFinished} ng-click=takeChallenge(participatingChallenge) class=\"btn btn-success btn-xs\">Take Challenge</button><div ng-show=participatingChallenge.hasFinished class=\"alert alert-danger\">Time is over!</div></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><table ng-class={spacer:!participatingChallenge.hasFinished} class=\"table table-hover\"><thead><tr><th>Applicants</th><th>Status</th></tr></thead><tbody><tr ng-repeat=\"person in participatingChallenge.people\"><td>{{person.user.name}}</td><td><span ng-hide={{person.hasStarted}} class=\"label label-warning\">Pending</span> <span ng-show=\"{{person.hasStarted}} && {{!person.hasFinished}}\" class=\"label label-info\">Started</span> <span ng-show={{person.gotItRight}} class=\"label label-success\">Right</span> <span ng-show={{person.hasFinished}} class=\"label label-default\">Finished</span> <span ng-hide=\"{{person.gotItRight}} || {{!person.hasFinished}}\" class=\"label label-danger\">Wrong</span></td></tr></tbody></table></div></div></accordion-group></accordion></div></div></div></div></div></div><!-- <script src=\"/js/home.js\" type=\"text/javascript\"></script> -->"
  );


  $templateCache.put('app/main/main.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><header class=hero-unit><div class=container><h1>You want problems?</h1><h1>We've got them!</h1><p class=lead>Improve your programming skills by solving our problems, and other people's problems.</p><img height=150px src=assets/images/yeoman.png alt=\"I'm Yeoman\"></div></header><div class=hero-unit><div class=container><div class=row><div class=col-lg-12><h1>How does it work:</h1><ul class=\"col-md-4 col-lg-4 col-sm-6\"><li>First create an account <a href=#>here</a></li><li>After you do that, you can make your own problems</li><li>Solve them and be happy!</li><li>If you pass all the test cases, you'll get a higher ranking</li></ul><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil possimus ullam suscipit non ea fuga unde nulla aperiam in, delectus culpa, perspiciatis eum vero? Tempore atque neque quos fuga laboriosam?</p></div></div></div></div><footer class=footer><div class=container><p><a href=\"https://github.com/DaftMonk/generator-angular-fullstack/issues?state=open\">Issues</a></p></div></footer>"
  );


  $templateCache.put('app/p/modal.html',
    "<div class=modal-header><h3 class=modal-title>Problem Saved!</h3></div><div class=modal-body><p>Your problem was saved successfully to our database!</p></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button></div>"
  );


  $templateCache.put('app/p/p.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h1>{{problem.title}}</h1><hr><div ng-bind-html=problem.description></div><hr></div><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Code</h4><select style=margin-bottom:15px class=form-control ng-model=currentMode ng-options=\"mode for mode in modes\" ng-change=codeModeChanged()></select><tabset><tab heading=Solution><div class=ace-editor ui-ace=codeOptions ng-model=code.solution[currentMode]></div></tab><tab heading=Run><div class=ace-editor ui-ace=testsOptions ng-model=code.run[currentMode]></div></tab></tabset></div></div><!--  <div class=\"row\" style=\"margin-bottom:15px;\">\n" +
    "        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">\n" +
    "            <h4>Tests</h4>\n" +
    "             <select style=\"margin-bottom:15px;\" class=\"form-control\" ng-model=\"tests.currentMode\" ng-options=\"mode for mode in modes\" ng-change=\"testsModeChanged()\"></select>\n" +
    "            <div ui-ace=\"testsOptions\" ng-model=\"tests.content\"></div>\n" +
    "        </div>\n" +
    "    </div> --><div class=row style=margin-bottom:15px><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div ng-show=output.result><progressbar value=output.result.testsPassed/output.result.numberOfTests*100>your score is {{output.result.score}}</progressbar></div><div ng-show=output.stdout class=\"alert alert-success\" role=alert ng-model=output.stdout></div><div ng-show=output.stderr class=\"alert alert-danger\" role=alert ng-model=output.stderr></div><div ng-show=output.error class=\"alert alert-info\" role=alert ng-model=output.error></div></div><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><button id=test-btn type=button ng-click=run() class=\"btn btn-default\">Run & Test</button> <button ng-click=save() type=button class=\"btn btn-success\">Save</button><div id=myspin></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div id=result class=\"alert alert-success\" role=alert></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div class=progress><div class=\"progress-bar progress-bar-success\"></div><div class=\"progress-bar progress-bar-danger\"></div></div></div></div><br><br></div>"
  );


  $templateCache.put('app/profile/profile.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><style>.ace_editor { height: 150px; font-size: 15px;}</style><div class=container><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div ng-repeat=\"o in userList\">{{o}}</div><hr><div ng-bind-html=problem.description></div><hr><button ng-click=open()></button></div><div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1\"></div></div><div class=row><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Code</h4><select style=margin-bottom:15px class=form-control ng-model=code.currentMode ng-options=\"mode for mode in modes\" ng-change=codeModeChanged()></select><div ui-ace=codeOptions></div></div></div><div class=row style=margin-bottom:15px><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><h4>Tests</h4><!--              <select style=\"margin-bottom:15px;\" class=\"form-control\" ng-model=\"tests.currentMode\" ng-options=\"mode for mode in modes\" ng-change=\"testsModeChanged()\"></select> --><div ui-ace=testsOptions ng-model=tests.content></div></div></div><div class=row style=margin-bottom:15px><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><button id=test-btn type=button class=\"btn btn-default\">Run & Test</button> <button id=save-btn type=button class=\"btn btn-success\">Save</button><div id=myspin></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div id=result class=\"alert alert-success\" role=alert></div></div></div><div class=row ng-show=beenTested><div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"><div class=progress><div class=\"progress-bar progress-bar-success\"></div><div class=\"progress-bar progress-bar-danger\"></div></div></div></div><br><br></div>"
  );


  $templateCache.put('app/search_user/search_user.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><table class=\"table table-hover\" id=friend_list><tr ng-repeat=\"d in docs\"><td class=\"info text-center\">{{d.name}}</td><td class=success>{{d.email}}</td><td class=warning ng-switch on=d.button><div ng-switch-when=add><button ng-hide=submitted class=\"btn btn-info\" ng-click=add(d._id,$index)><i class=\"glyphicon glyphicon-plus\"><span>{{d.button}}</span></i></button> <span ng-show=submitted>the request is sent</span></div><button ng-disable=true ng-switch-when=remove class=\"btn btn-danger\"><i class=\"glyphicon glyphicon-ok-sign\"><span>added</span></i></button> <span ng-switch-when=requesting>the request is sent</span></td><!--  <td><button   ng-disabled='submitted' style='display:inline-block' class='btn btn-info' ng-click='add(d._id,$index)'><i class='glyphicon glyphicon-plus'><span>{{d.button}}</span></i></button></td>\n" +
    "    <td class='danger'  style='color:crimson' ng-show='message[$index]' >the request is already submitted!\n" +
    "</td> --></tr></table></div>"
  );


  $templateCache.put('components/navbar/navbar.html',
    "<style>.notification{\n" +
    "  width: 300px;\n" +
    "  background-color: #FFC557;\n" +
    "  color: black;\n" +
    "}\n" +
    "\n" +
    ".notification div p{\n" +
    "padding:1px 5px 0 5px;\n" +
    "margin-bottom: 0px;\n" +
    "}\n" +
    "\n" +
    ".tq7 {\n" +
    "  background-color: #69A655;\n" +
    "}\n" +
    "\n" +
    ".notification hr{\n" +
    "  margin-top: 5px;\n" +
    "  margin-bottom: 0;\n" +
    "}</style><div class=\"navbar-inverse navbar-static-top\" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click=\"isCollapsed = !isCollapsed\"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href=\"/\" class=navbar-brand>my-editor</a></div><div collapse=isCollapsed class=\"navbar-collapse collapse\" id=navbar-main><ul class=\"nav navbar-nav\"><li ng-repeat=\"item in menu\" ng-class=\"{active: isActive(item.link)}\"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class=\"{active: isActive('/admin')}\"><a href=/admin>Admin</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/signup')}\"><a href=/signup>Sign up</a></li><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/login')}\"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>{{ user.name }}</p></li><li ng-show=isLoggedIn() class=dropdown><a href=# class=dropdown-toggle><i class=\"glyphicon glyphicon-off\"></i></a><ul class=dropdown-menu role=menu><li><a href=/settings>setting</a></li><li><a href=/friends>Friends</a></li><li class=divider></li><li><a href=# ng-click=logout()>Log Out</a></li></ul></li><li ng-show=isLoggedIn() class=dropdown><a id=messagebox ng-click=\"news = false\" href=# class=dropdown-toggle><i class=\"glyphicon glyphicon-envelope\"><span ng-show=news class=badge id=badge>!</span></i></a><ul ng-click=$event.stopPropagation(); class=\"dropdown-menu notification\" role=menu id=request_list><li ng-repeat=\"l in user.request_friends\"><div class=clearfix><p style=color:#CC6857>{{l.name}}</p><p>wants to add you as a friend</p><button ng-click=add(l._id) class=\"btn btn-success btn-xs tq7\">add</button> <button ng-click=ignore(l._id) class=\"btn btn-danger btn-xs\">ignore</button></div><hr></li><li ng-repeat=\"i in user.message\"><div class=clearfix><p style=color:#CC6857>{{i.sender.name}}</p><p>wants to invite you to collaborate coding</p><button ng-click=acceptColla(i) class=\"btn btn-success btn-xs tq7\">accept</button> <button ng-click=ignoreColla(i) class=\"btn btn-danger btn-xs\">decline</button></div><hr></li></ul></li><li ng-show=isLoggedIn() class=dropdown><a href=/addProblem><i class=\"glyphicon glyphicon-pencil\"></i></a></li></ul></div></div></div>"
  );


  $templateCache.put('components/popup/popup.html',
    "<div class=modal-header><h3 class=modal-title>choose your friends!</h3></div><div class=modal-body><multiselect class=input-xlarge multiple ng-model=o.selectedFriends options=\"f.name for f in u.friends\" change=selected()></multiselect><table class=table><tr ng-repeat=\"sf in selectedFriends\"><td>{{sf.name}}</td><td>{{sf.email}}</td></tr></table></div><div class=modal-footer><button class=\"btn btn-primary\" ng-click=ok()>OK</button> <button class=\"btn btn-warning\" ng-click=cancel()>Cancel</button></div>"
  );

}]);

