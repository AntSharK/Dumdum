/***
BUTTON CLICKS
***/
document.getElementById("joinroombutton").addEventListener("click", function (event) {
    var userNameIn = document.getElementById("username").value;
    var roomIdIn = document.getElementById("roomid").value;
    var colorIn = document.getElementById("colorpicker").value;

    connection.invoke("JoinRoom", userNameIn, roomIdIn, colorIn).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});
/***
MESSAGES FROM HUB
***/
connection.on("FreshConnection", function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var sessionUserName = sessionStorage.getItem(UserIdSessionStorageKey)
    if (sessionRoomId != null && sessionUserName != null) {
        connection.invoke("ResumePlayerSession", sessionUserName, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

connection.on("PlayerJoinRoom", function (userName, roomId) {
    SwitchToWaitingView(userName, roomId);
});

connection.on("Reconnect_ResumeWaiting", function (userName, roomId) {
    SwitchToWaitingView(userName, roomId);
});

connection.on("StartGame", function (playersConcat, userJoined) {
    document.body.innerHTML = "";
    var game = new Swollball_Player_Game();
});


/***
VIEW CHANGES
***/

var SwitchToWaitingView = function (sessionUserId, sessionRoomId) {
    // Write to session storage
    sessionStorage.setItem(RoomIdSessionStorageKey, sessionRoomId);
    sessionStorage.setItem(UserIdSessionStorageKey, sessionUserId);

    var elements = document.getElementsByClassName("state");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }

    document.getElementById("pageName").textContent = "LOBBY: " + sessionRoomId;
    document.getElementById("startLobby").style.display = "block";
}