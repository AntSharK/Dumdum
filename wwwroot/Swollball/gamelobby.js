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

// Update the lobby state when a player joins
connection.on("CreateRoom_GetId", function (roomId) {
    SwitchToHostView(roomId);
});

connection.on("Reconnect_ResumeRoom", function (room) {
    SwitchToHostView(room.roomId);
    UpdatePlayerList(room.players);
})

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
    var playerList = document.getElementById("lobbyList");
    playerList.innerHTML = "";
    for (let i = 0; i < players.length; i++) {
        var li = document.createElement("li");
        li.textContent = players[i].name;
        playerList.appendChild(li);
    }

    document.getElementById("lobbyplayercount").textContent = players.length;
}

connection.on("FreshConnection", function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    if (sessionRoomId != null) {
        connection.invoke("ResumeHostSession", sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

// Update the lobby state when a player joins
connection.on("StartGame", function (playersConcat, userJoined) {
    document.body.innerHTML = "";
    var game = new SimpleGame();
});