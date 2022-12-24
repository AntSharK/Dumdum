const RoomIdSessionStorageKey = "roomid";

var roomId;
var reconnecting = true;

var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

connection.on("ShowError", function (errorMessage) {
    window.alert(errorMessage);
});

// Create a new room in the lobby
document.getElementById("createroombutton").addEventListener("click", function (event) {
    connection.invoke("CreateRoom").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

// Update the lobby state when a player joins
connection.on("JoinRoom_UpdateState", function (playersConcat, userJoined) {
    var playerList = document.getElementById("lobbyList");
    playerList.innerHTML = "";
    var players = playersConcat.split("|");
    for (let i = 0; i < players.length; i++) {
        var li = document.createElement("li");
        li.textContent = players[i];
        playerList.appendChild(li);
    }

    document.getElementById("lobbyplayercount").textContent = players.length + "/20";
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("FreshConnection", function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    //reconnecting = false;

    if (sessionRoomId != null) {
        // Resume the session
        roomId = sessionRoomId;

        connection.invoke("ResumeHost", roomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

connection.on("ClearState", function () {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
})

var conditionalReload = function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);

    if (sessionRoomId != null) {
        // TODO: Reload state
    }
}

window.onload = conditionalReload;