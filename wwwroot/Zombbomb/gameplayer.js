/***
BUTTON CLICKS
***/
document.getElementById("joinroombutton").addEventListener("click", function (event) {
    var roomIdIn = document.getElementById("roomid").value;
    var colorIn = document.getElementById("colorpicker").value;
    sessionStorage.setItem(ZombieColorStorageKey, colorIn);

    connection.invoke("JoinRoom", roomIdIn, colorIn).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

document.getElementById("colorpicker").value = GetRandomColor();
function GetRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

connection.on("BeZombie", function (zombieId, roomId, leftBoundIn, rightBoundIn, topBoundIn, bottomBoundIn, zombieSpeed, respawnTime, isRespawnEvent) {
    RIGHTBOUND = rightBoundIn;
    LEFTBOUND = leftBoundIn;
    BOTTOMBOUND = bottomBoundIn;
    TOPBOUND = topBoundIn;
    ZOMBIESPEED = zombieSpeed;
    RESPAWNTIME = respawnTime;

    sessionStorage.setItem(UserIdSessionStorageKey, zombieId);
    sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
    if (!isRespawnEvent) {
        document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:93vh\"></div>";
        Game = new Zombbomb_Player_Game();
    }
});

connection.on("SetPosition", function (x, y) {
    XLOC = x;
    YLOC = y;
    READYFORCONTROL = true; // Only after receiving 'SetPosition' is state synchronized
});

connection.on("SetBounds", function (leftBoundIn, rightBoundIn, topBoundIn, bottomBoundIn) {
    RIGHTBOUND = rightBoundIn;
    LEFTBOUND = leftBoundIn;
    BOTTOMBOUND = bottomBoundIn;
    TOPBOUND = topBoundIn;
});

connection.on("ZombieDead", function () {
    startRespawnTimer(Game.game);
});

function updateServerPosition() {    
    connection.invoke("UpdateServerZombiePosition",
        sessionStorage.getItem(RoomIdSessionStorageKey),
        sessionStorage.getItem(UserIdSessionStorageKey),
        XLOC,
        YLOC).catch(function (err) {
            return console.error(err.toString());
        });
}

function respawnPlayer() {
    var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var sessionId = sessionStorage.getItem(UserIdSessionStorageKey);
    var color = sessionStorage.getItem(ZombieColorStorageKey);

    connection.invoke("RespawnZombie", roomId, sessionId, color).catch(function (err) {
        return console.error(err.toString());
    });
}