function StartWave(arena: BattleArena) {
    var playerCount = arena.octopi.getLength();
    var roundDuration = 30000 + arena.currentRound * 4000;
    switch (arena.currentRound) {
        case 1:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, playerCount * 3, roundDuration,
                3500 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1.0 /*Difficulty*/);
            break;

        case 2:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, playerCount * 3, roundDuration,
                3500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.05 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 1, roundDuration,
                5500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.0 /*Difficulty*/);
            break;

        case 3:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, playerCount * 3, roundDuration,
                3200 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 1, roundDuration,
                4000 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            break;

        case 4:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 3, roundDuration,
                5600 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, playerCount * 1, roundDuration,
                3600 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1 /*Difficulty*/);
            break;

        case 5:
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, playerCount * 2, roundDuration,
                4200 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1.2 /*Difficulty*/);
            break;

        case 6:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 2, roundDuration,
                3800 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.2 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_ZIPPINGFISH, playerCount * 3, roundDuration,
                6500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            break;

        case 7:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 1, roundDuration,
                3500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_ZIPPINGFISH, playerCount * 2, roundDuration,
                5500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, playerCount * 2, roundDuration,
                6500 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1.1 /*Difficulty*/);
            break;

        case 8:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, playerCount * 2, roundDuration,
                3200 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.3 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_CHARGINGFISH, playerCount * 1, roundDuration,
                3400 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.15 /*Difficulty*/);
            break;

        case 9:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, playerCount * 1, roundDuration,
                4500 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.3 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_CHARGINGFISH, playerCount * 2, roundDuration,
                5100 /*Base Interval*/, 0.99 /*Interval Modification Factor*/, 1.3 /*Difficulty*/);
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, playerCount * 2, roundDuration,
                4500 /*Base Interval*/, 0.98 /*Interval Modification Factor*/, 1.3 /*Difficulty*/);
            break;

        default: // Variable spawning
            var numberOfSpawnEvents = Math.sqrt(arena.currentRound) * 2;
            for (var i = 0; i < numberOfSpawnEvents; i++) {
                let randomNumber = Math.floor(Math.random() * 5);
                let intervalModificationFactor = 1.0 - i * 0.01;
                let difficulty = 1.0 + Math.sqrt(arena.currentRound) - i / 2;

                let enemyType: string;
                let spawnMultiplier: number;
                let baseInterval: number;
                switch (randomNumber) {
                    case 0:
                        enemyType = FISHNAME_REGULARFISH;
                        spawnMultiplier = 3;
                        baseInterval = 3600;
                        break;
                    case 1:
                        enemyType = FISHNAME_HOMINGFISH;
                        spawnMultiplier = 2;
                        baseInterval = 4100;
                        break;
                    case 2:
                        enemyType = FISHNAME_MERGINGFISH;
                        spawnMultiplier = 2;
                        baseInterval = 4600;
                        break;
                    case 3:
                        enemyType = FISHNAME_ZIPPINGFISH;
                        spawnMultiplier = 3;
                        baseInterval = 6600;
                        break;
                    case 4:
                        enemyType = FISHNAME_CHARGINGFISH;
                        spawnMultiplier = 2;
                        baseInterval = 6400;
                        break;
                    default:
                        break;
                }

                AddSpawnTimer(arena, enemyType, playerCount * spawnMultiplier, roundDuration,
                    baseInterval + i * 100, intervalModificationFactor, difficulty /*Difficulty*/);
            }
            break;
    }

    arena.roundTimer = new Phaser.Time.TimerEvent({ delay: roundDuration, callback: arena.finishRound, callbackScope: arena });
    arena.time.addEvent(arena.roundTimer);
}

function AddSpawnTimer(arena: BattleArena,
    fishType: string,
    spawnCount: integer,
    roundDuration: integer,
    startingInterval: number,
    intervalModificationFactor: number,
    difficulty: number) {
    const STARTSPAWNTIME = 2000;
    const STOPSPAWNTIME = 5000;

    var interval = startingInterval;
    for (var i = STARTSPAWNTIME; i < roundDuration - STOPSPAWNTIME; i = i + interval) {
        interval = interval * intervalModificationFactor;

        arena.time.addEvent({
            delay: i,
            callback: () => Fish.SpawnFishes(arena, spawnCount, arena.spawningRect, arena.fishes, arena.octopi, fishType, difficulty),
            callbackScope: arena,
            loop: false,
            repeat: 0,
        });
    }
}


