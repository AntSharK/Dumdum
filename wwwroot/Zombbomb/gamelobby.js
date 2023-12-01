/***
BUTTON CLICKS
***/
document.getElementById("createroombutton").addEventListener("click", function (event) {
    connection.invoke("CreateRoom").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});

connection.on("StartGame", function () {
    document.body.innerHTML = "<div id='controlbar' style=\"min-height:20px; height:2vh\"></div><div id='phaserapp' style=\"height:93vh\"></div>";
    Game = new Zombbomb_Lobby_Game();
});

connection.on("SpawnZombie", function (zombieId) {
    var newZombie = spawnZombie(zombieId, Game.game);
    connection.invoke("SetZombiePosition", zombieId, newZombie.x, newZombie.y).catch(function (err) {
        return console.error(err.toString());
    });
})

connection.on("UpdatePosition", function (zombieId, x, y) {
    updatePosition(zombieId, x, y, Game.game);
})