/***
BUTTON CLICKS
***/
document.getElementById("joinroombutton").addEventListener("click", function (event) {
    var roomIdIn = document.getElementById("roomid").value;
    var colorIn = document.getElementById("colorpicker").value;

    connection.invoke("JoinRoom", roomIdIn, colorIn).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

connection.on("BeZombie", function (zombieId, roomId, leftBoundIn, rightBoundIn, topBoundIn, bottomBoundIn) {
    rightBound = rightBoundIn;
    leftBound = leftBoundIn;
    bottomBound = bottomBoundIn;
    topBound = topBoundIn;

    sessionStorage.setItem(UserIdSessionStorageKey, zombieId);
    sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
    document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:93vh\"></div>";
    Game = new Zombbomb_Player_Game();
});

connection.on("SetPosition", function (x, y) {
    xLoc = x;
    yLoc = y;
});


connection.on("SetBounds", function (leftBoundIn, rightBoundIn, topBoundIn, bottomBoundIn) {
    rightBound = rightBoundIn;
    leftBound = leftBoundIn;
    bottomBound = bottomBoundIn;
    topBound = topBoundIn;
});

//setInterval(updateServerPosition, 100);

function updateServerPosition() {    
    connection.invoke("UpdateServerZombiePosition",
        sessionStorage.getItem(RoomIdSessionStorageKey),
        sessionStorage.getItem(UserIdSessionStorageKey),
        xLoc,
        yLoc).catch(function (err) {
            return console.error(err.toString());
        });
}

connection.on("ZombieDead", function () {
    startRespawnTimer(Game.game);
});