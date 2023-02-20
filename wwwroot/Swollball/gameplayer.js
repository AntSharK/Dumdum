/***
BUTTON CLICKS
***/
document.getElementById("joinroombutton").addEventListener("click", function (event) {
    var userNameIn = document.getElementById("username").value;
    var roomIdIn = document.getElementById("roomid").value;
    var colorIn = document.getElementById("colorpicker").value;

    if (userNameIn.length <= 0) {
        return;
    }

    connection.invoke("JoinRoom", userNameIn, roomIdIn, colorIn).catch(function (err) {
        return console.error(err.toString());
    });

    event.preventDefault();
});

document.getElementById("leaveroombutton").addEventListener("click", function (event) {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var sessionUserName = sessionStorage.getItem(UserIdSessionStorageKey)

    connection.invoke("KickPlayer", sessionRoomId, sessionUserName).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

// TODO (TEST): TEST FUNCTION
window.onkeydown = function (k) {
    if (k.keyCode == 39) {
        connection.invoke("TESTSTART").catch(function (err) {
            return console.error(err.toString());
        });
    }
}

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

function StartGame(sceneToStartOn) {
    document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:80vh\"></div>";
    document.getElementById("controlbar").innerHTML = "<text id='loadingbar'></text><a href = 'javascript:window.location.reload()' style = 'float:right' > REFRESH</a> ";
    Game = new Swollball_Player_Game();
}

connection.on("StartNextRound", function () {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var sessionUserName = sessionStorage.getItem(UserIdSessionStorageKey)
    if (sessionRoomId != null && sessionUserName != null) {
        connection.invoke("StartNextPlayerRound", sessionUserName, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
});

connection.on("EndGame", function (leaderboardData) {
    InitializeLeaderboardData(leaderboardData);
    SceneTransition("BallUpgrades", "EndScreen");
    ClearState();
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

    // Send a GET to update game data
    window.fetch("//" + location.host + location.pathname + "?action=GAMESTARTACTION&userNameIn=" + sessionUserId + "&roomIdIn=" + sessionRoomId);
}

document.getElementById("colorpicker").value = GetRandomColor();
function GetRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var conditionalReload = function () {
    var sessionRoomId = sessionStorage.getItem("roomid");
    var sessionUserId = sessionStorage.getItem("userid");

    if (sessionRoomId != null && sessionUserId != null) {
        var elements = document.getElementsByClassName("state");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }

        document.getElementById("pageName").textContent = "RECONNECTING...";
    }
    else {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        let roomIdIn = params.RoomId;
        if (roomIdIn.length > 0) {
            document.getElementById("roomid").value = roomIdIn;
        }
    }
}

window.onload = conditionalReload;