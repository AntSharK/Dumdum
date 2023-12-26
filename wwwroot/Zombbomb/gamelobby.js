/***
BUTTON CLICKS
***/
document.getElementById("createroombutton").addEventListener("click", function (event) {
    var explodeTime = document.getElementById("explodetimer").value;
    var zombieSpeed = document.getElementById("zombiespeed").value;
    var playerSpeed = document.getElementById("playerspeed").value;
    var reloadTime = document.getElementById("reloadtime").value;
    var respawnTime = document.getElementById("respawntime").value;
    connection.invoke("CreateRoom", explodeTime, zombieSpeed, playerSpeed, reloadTime, respawnTime).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

/***
MESSAGES FROM HUB
***/
connection.on("StartGame", function (roomId, explodeTime, zombieSpeed, playerSpeed, reloadTime) {
    sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
    document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:93vh\"></div>";
    Game = new Zombbomb_Lobby_Game();
    PLAYERSPEED = playerSpeed;
    ZOMBIESPEED = zombieSpeed;
    EXPLODETIME = explodeTime;
    RELOADTIME = reloadTime;
    RESPAWNTIME = respawnTime;
});

connection.on("SpawnZombie", function (zombieId, color) {
    var newZombie = spawnZombie(zombieId, color, Game.game);

    connection.invoke("SetZombiePosition", sessionStorage.getItem(RoomIdSessionStorageKey), zombieId, newZombie.x, newZombie.y).catch(function (err) {
        return console.error(err.toString());
    });
})

connection.on("UpdatePosition", function (zombieId, x, y) {
    updatePosition(zombieId, x, y, Game.game);
})

/***
FUNCTIONS
***/
function destroyZombie(zombie) {
    connection.invoke("DestroyZombie", sessionStorage.getItem(RoomIdSessionStorageKey), zombie.playerId).catch(function (err) {
        return console.error(err.toString());
    });
}

function startRound() {
    connection.invoke("StartRound", sessionStorage.getItem(RoomIdSessionStorageKey)).catch(function (err) {
        return console.error(err.toString());
    });
}

function endRound() {
    GAMESTATE = "GameOver";
    connection.invoke("EndRound", sessionStorage.getItem(RoomIdSessionStorageKey)).catch(function (err) {
        return console.error(err.toString());
    });
}

function resetZombies() {
    connection.invoke("ResetHostSession", sessionStorage.getItem(RoomIdSessionStorageKey)).catch(function (err) {
        return console.error(err.toString());
    });
}