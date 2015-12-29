var app = angular.module('DailyFantasyFootball');

app.controller('HomeCtrl', ['$scope', '$resource',
    function($scope, $resource) {
        var Weeks = $resource('/api/v1/weeks');

        Weeks.query(function(weeks) {
            $scope.weeks = weeks;
        });
    }
]);

app.controller('UserCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {        
        var Users = $resource('/api/v1/users/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Users.get({ id: $routeParams.id }, function(user) {
            $scope.user = user;
        });

        $scope.save = function() {
            Users.update($scope.user, function() {
                $location.path('/');
            });
        };

        $scope.delete = function() {
            Users.delete({ id: $routeParams.id }, function(user) {
                $location.path('/');
            });
        };
    }
]);

app.controller('MeCtrl', ['$rootScope', '$scope', '$resource', '$location', 
    function($rootScope, $scope, $resource, $location) {
        var Me = $resource('/api/v1/users/me');

        Me.get(function(user) {
            $scope.user = user;
        });

        $scope.delete = function() {
            Me.delete(function(user) {
                // TODO: Create a service for managing user state
                $rootScope.user = null;
                $location.path('/');
            });
        };
    }
]);

app.controller('AdminCtrl', ['$rootScope', '$scope', '$resource', '$location',
    function($rootScope, $scope, $resource, $location) {
        // TODO: Move the admin check to a service. This check should probably be in one
        // of those 'resolve' things rather than in this contoller too...
        if (!$rootScope.user.isAdmin) {
            $location.path('/');
        } else {
            var Users = $resource('/api/v1/users');

            Users.query(function(users) {
                $scope.users = users;
            });

            var Weeks = $resource('/api/v1/weeks');

            Weeks.query(function(weeks) {
                $scope.weeks = weeks;
            });
        }
    }
]);

app.controller('AddWeekCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        $scope.pageHeader = 'Add a week';

        $scope.datePickerStatus = {
            lockOpened: false,
            endOpened: false
        };

        $scope.lockDate = new Date();
        $scope.lockTime = new Date();

        $scope.endDate = new Date();
        $scope.endTime = new Date();

        $scope.lockDateOpen = function($event) {
            $scope.datePickerStatus.lockOpened = true;
        };

        $scope.endDateOpen = function($event) {
            $scope.datePickerStatus.endOpened = true;
        };

        // Default to the next Thursday for the lock date
        $scope.lockDate.setDate($scope.lockDate.getDate() + (4 - $scope.lockDate.getDay() + 6) % 6);
        $scope.lockTime.setHours(17);
        $scope.lockTime.setMinutes(0);
        $scope.lockTime.setSeconds(0);
        
        // Default to the Tuesday following that for the end date
        $scope.endDate.setDate($scope.lockDate.getDate() + 5);
        $scope.endTime.setHours(1);
        $scope.endTime.setMinutes(0);
        $scope.endTime.setSeconds(0);

        $scope.submitResult = {
            isError: false
        };

        $scope.save = function() {
            // TODO: check that $scope.week is valid

            var Weeks = $resource('/api/v1/weeks');

            // TODO: Validate other inputs, like dates, etc

            // Put the date/time inputs into the proper format
            // $scope.week.
            var lockDateTime = new Date(
                $scope.lockDate.getFullYear(),
                $scope.lockDate.getMonth(),
                $scope.lockDate.getDate(),
                $scope.lockTime.getHours(),
                $scope.lockTime.getMinutes(),
                0);

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();
            $scope.week.weekEndDate = endDateTime.toISOString();

            Weeks.save($scope.week, function() {
                $location.path('/admin');
            }, function(err) {
                $scope.submitResult.msg = err.data;
                $scope.submitResult.isError = true;
            });
        };
    }
]);

// TODO: Refactor shared code between this and the AddWeekCtrl
app.controller('EditWeekCtrl', ['$scope', '$resource', '$location', '$routeParams',
    function($scope, $resource, $location, $routeParams) {
        $scope.pageHeader = 'Edit week';
        $scope.weekNumber = $routeParams.id;

        var Weeks = $resource('/api/v1/weeks/:id', { id: '@_id' }, {
            update: { method: 'PUT' }
        });

        Weeks.get({ id: $routeParams.id }, function(week) {
            $scope.week = week;

            $scope.lockDate = new Date($scope.week.weekLockDate);
            $scope.lockTime = new Date($scope.week.weekLockDate);

            $scope.endDate = new Date($scope.week.weekEndDate);
            $scope.endTime = new Date($scope.week.weekEndDate);

            $scope.editingWeek = true;

        });

        $scope.datePickerStatus = {
            lockOpened: false,
            endOpened: false
        };

        $scope.lockDateOpen = function($event) {
            $scope.datePickerStatus.lockOpened = true;
        };

        $scope.endDateOpen = function($event) {
            $scope.datePickerStatus.endOpened = true;
        };

        $scope.submitResult = {
            isError: false
        };

        $scope.save = function() {
            // TODO: Validate other inputs, like dates, etc

            // Put the date/time inputs into the proper format
            // $scope.week.
            var lockDateTime = new Date(
                $scope.lockDate.getFullYear(),
                $scope.lockDate.getMonth(),
                $scope.lockDate.getDate(),
                $scope.lockTime.getHours(),
                $scope.lockTime.getMinutes(),
                0);

            var endDateTime = new Date(
                $scope.endDate.getFullYear(),
                $scope.endDate.getMonth(),
                $scope.endDate.getDate(),
                $scope.endTime.getHours(),
                $scope.endTime.getMinutes(),
                0);

            $scope.week.weekLockDate = lockDateTime.toISOString();
            $scope.week.weekEndDate = endDateTime.toISOString();

            console.log('LockDate: ' + lockDateTime.toString() + '(' + $scope.week.weekLockDate + ')');
            console.log('EndDate: ' + endDateTime.toString() + '(' + $scope.week.weekEndDate + ')');

            Weeks.update($scope.week, function() {
                $location.path('/admin');
            }, function(err) {
                $scope.submitResult.msg = err.data;
                $scope.submitResult.isError = true;
            });
        };

        $scope.delete = function() {
            Weeks.delete( { id: $scope.week.weekNumber }, function() {
                $location.path('/admin');
            });
        };
    }
]);

app.controller('NavbarCtrl', ['$rootScope', '$scope', '$location', 
    function($rootScope, $scope, $location) {
        $scope.user = $rootScope.user;
    }
]);

app.controller('EditPlayersCtrl', ['$scope', '$resource', '$routeParams', '$location',
    function($scope, $resource, $routeParams, $location) {
        $scope.sortType = 'name';
        $scope.sortReverse = false;
        $scope.searchField = '';

        var WeekPlayers = $resource('/api/v1/weeks/:id/players', { id: '@_id'}, {
            update: { method: 'PUT' }
        });

        WeekPlayers.get({ id: $routeParams.id }, function(week) {
            $scope.week = week;
            $scope.players = week.players;
        });

        $scope.playerFilter = function(item) {
            // Match against "First Last First" so we cover people who like to search both ways.
            var matchString = item.player.firstName.toLowerCase() + ' ' 
                + item.player.lastName.toLowerCase() + ' '
                + item.player.firstName.toLowerCase();

            return (matchString.indexOf($scope.searchField.toLowerCase()) != -1);
        };

        var findOrCreatePlayer = function(player, callback) {
            var Players = $resource('/api/v1/players');

            Players.query({
                firstName: player.firstName,
                lastName: player.lastName,
                position: player.position,
                team: player.team
            }, function(returnedPlayers) {
                if (returnedPlayers.length > 0) {
                    // We found an existing player, so return that player's id
                    callback({ created: false, player: returnedPlayers[0]});
                }
                else {
                    // Didn't find a player, so we'll create a new one
                    Players.save(player, function(savedPlayer) {
                        callback({ created: true, player: savedPlayer});
                    }, function() {
                        console.log('**** FAILURE!');
                        console.dir(player);
                    });
                }
            });
            
        };

        $scope.parsePlayerFile = function(event) {
            var playerFiles = event.target.files;

            if (playerFiles.length != 1) {
                return;
            }

            var playerFile = playerFiles[0];

            var reader = new FileReader();
            reader.readAsText(playerFile);

            reader.onloadend = function() {
                var lines = reader.result.split('\n');

                // The first line may be a header, just check the first word for "Position"
                var firstLineWords = lines[0].split(',');
                var i = (firstLineWords[0].toLowerCase() === 'position') ? 1 : 0;
                for (; i < lines.length; i++)
                {
                    var playerFields = lines[i].split(',');
                    var player = {
                        position: playerFields[0].toUpperCase().trim(),
                        firstName: playerFields[1].split(' ', 1)[0].trim(),
                        lastName: playerFields[1].substr(playerFields[1].indexOf(' ') + 1).trim(),
                        team: playerFields[5].toUpperCase().trim()
                    };

                    if (player.position === 'DST')
                    {
                        // Special case for defenses. Put the team name as the last name and leave the first
                        // name blank.
                        player.lastName = playerFields[1].trim();
                    }
                    else
                    {
                        player.firstName = playerFields[1].split(' ', 1)[0].trim();
                        player.lastName = playerFields[1].substr(playerFields[1].indexOf(' ') + 1).trim();
                    }

                    // We need to wrap this code in a function so we can capture the PlayerFields
                    // since JS only supports global and function scope (not for loop scope).
                    (function(playerFields) {
                        findOrCreatePlayer(player, function(playerResult) {
                            var newItem = {
                                player: playerResult.player,
                                salary: playerFields[2].trim(),
                                matchup: playerFields[3].toUpperCase().split(' ', 1)[0].trim(),
                                created: playerResult.created
                            };
                            $scope.players.push(newItem);
                        });
                    })(playerFields);
                }
            };
        };

        $scope.save = function() {
            WeekPlayers.delete( {id: $routeParams.id}, function() {
                WeekPlayers.save({ id: $routeParams.id}, $scope.week.players, function() {
                    // TODO: Add flash message for success/fail
                    $location.path('/week/' + $routeParams.id);
                });
            });
        };

        $scope.delete = function() {
            WeekPlayers.delete({ id: $routeParams.id }, function() {
                // TODO: Probably just reload table content?
                $location.path('/week/' + $routeParams.id);
            });
        }
    }
]);