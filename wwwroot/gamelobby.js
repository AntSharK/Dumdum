const RoomIdSessionStorageKey = "roomid";

var roomId;
var reconnecting = true;

var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

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

// Update the lobby state when a player joins
connection.on("StartGame", function (playersConcat, userJoined) {
    document.body.innerHTML = "";
    var game = new SimpleGame();
});

connection.start().catch(function (err) {
    return console.error(err.toString());
});

window.onload = conditionalReload;