/***
BUTTON CLICKS
***/
document.getElementById("createroombutton").addEventListener("click", function (event) {
    connection.invoke("CreateRoom").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("startbutton").addEventListener("click", function (event) {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    connection.invoke("StartRoom", sessionRoomId).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

/***
MESSAGES FROM HUB
***/
connection.on("FreshConnection", function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    if (sessionRoomId != null) {
        connection.invoke("ResumeHostSession", sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

connection.on("CreateRoom_GetId", function (roomId) {
    SwitchToHostView(roomId);
});

connection.on("Reconnect_ResumeRoomSetup", function (room) {
    SwitchToHostView(room.roomId);
    UpdatePlayerList(room.players);
});

connection.on("HostUpdateRoom", function (room) {
    UpdatePlayerList(room.players);
});

connection.on("UpdateBalls", function (ballData) {
    InitializeBallData(ballData);
});

connection.on("UpdateLeaderboard", function (leaderboardData) {
    InitializeLeaderboardData(leaderboardData);
});

connection.on("StartGame", function () {
    document.body.innerHTML = "";
    Game = new SimpleGame();
});

connection.on("StartNextRound", function () {
    SceneTransition("Leaderboard", "BallArena");
})

/***
VIEW CHANGES
***/

var SwitchToHostView = function (sessionRoomId) {
    // Write to session storage
    sessionStorage.setItem(RoomIdSessionStorageKey, sessionRoomId);

    var elements = document.getElementsByClassName("state");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }

    document.getElementById("pageName").textContent = "LOBBY: " + sessionRoomId;
    document.getElementById("startLobby").style.display = "block";
}

var UpdatePlayerList = function (players) {
    var playerCount = 0;
    var playerList = document.getElementById("lobbyList");
    playerList.innerHTML = "";
    for (var key in players) {
        playerCount++;
        var player = players[key];
        var li = document.createElement("li");
        li.textContent = player.name + "\t";
        
        var kickbutton = document.createElement("input");
        kickbutton.type = "button";
        kickbutton.value = "BOOT";
        kickbutton.addEventListener("click", function (event) {
            var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
            connection.invoke("KickPlayer", sessionRoomId, player.name).catch(function (err) {
                return console.error(err.toString());
            });
            event.preventDefault()
        });

        li.appendChild(kickbutton);
        playerList.appendChild(li);
    }

    document.getElementById("lobbyplayercount").textContent = playerCount + " PLAYERS JOINED";
}