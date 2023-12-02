/***
BUTTON CLICKS
***/
document.getElementById("joinroombutton").addEventListener("click", function (event) {
    connection.invoke("JoinRoom").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

connection.on("BeZombie", function (zombieId) {
    sessionStorage.setItem(UserIdSessionStorageKey, zombieId);
    document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:93vh\"></div>";
    Game = new Zombbomb_Player_Game();
});

connection.on("SetPosition", function (x, y) {
    xLoc = x;
    yLoc = y;
});

//setInterval(updateServerPosition, 100);

function updateServerPosition() {    
    connection.invoke("UpdateServerZombiePosition",
        sessionStorage.getItem(UserIdSessionStorageKey),
        xLoc,
        yLoc).catch(function (err) {
            return console.error(err.toString());
        });
}

connection.on("ZombieDead", function () {
    window.location.reload();
});