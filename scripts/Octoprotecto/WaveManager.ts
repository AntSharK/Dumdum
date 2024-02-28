function StartWave(arena: BattleArena) {
    var playerCount = arena.octopi.getLength();
    var roundDuration = 30000 + arena.currentRound * 4000;
    switch (arena.currentRound) {
        case 1:
            var baseInterval = 3400;
            for (var i = 3500; i < roundDuration - 3000; i = i + baseInterval) {
                baseInterval = baseInterval - 50;
                arena.time.addEvent({
                    delay: i,
                    callback: () => Fish.SpawnFishes(arena, playerCount * 3, arena.spawningRect, arena.fishes, arena.octopi, "starfish", 1),
                    callbackScope: arena,
                    loop: false,
                    repeat: 0,
                });
            }
            for (var i = 3000; i < roundDuration - 6000; i = i + 5000) {
                arena.time.addEvent({
                    delay: i,
                    callback: () => Fish.SpawnFishes(arena, playerCount * 1, arena.spawningRect, arena.fishes, arena.octopi, "homingfish", 1),
                    callbackScope: arena,
                    loop: false,
                    repeat: 0,
                });
            }
            break;
        default:
            console.log("Round " + arena.currentRound + " not yet created.");
            var baseInterval = 2400;
            for (var i = 3500; i < roundDuration - 3000; i = i + baseInterval) {
                baseInterval = baseInterval * 0.98;
                arena.time.addEvent({
                    delay: i,
                    callback: () => Fish.SpawnFishes(arena, playerCount * 4, arena.spawningRect, arena.fishes, arena.octopi, "starfish", 1),
                    callbackScope: arena,
                    loop: false,
                    repeat: 0,
                });
            }
            break;
    }

    arena.roundTimer = new Phaser.Time.TimerEvent({ delay: roundDuration, callback: arena.finishRound, callbackScope: arena });
    arena.time.addEvent(arena.roundTimer);
}