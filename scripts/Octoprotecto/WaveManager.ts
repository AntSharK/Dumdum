function StartWave(arena: BattleArena) {
    var roundDuration = 30000 + BattleArena.CurrentRound * 4000;
    switch (BattleArena.CurrentRound) {
        case 1:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, 3 /*Spawn Count*/, roundDuration,
                3500 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.0 * BattleArena.DifficultyMultiplier);
            break;

        case 2:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, 3 /*Spawn Count*/, roundDuration,
                3500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.1 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 2 /*Spawn Count*/, roundDuration,
                5500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.1 * BattleArena.DifficultyMultiplier);
            break;

        case 3:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, 4 /*Spawn Count*/, roundDuration,
                3200 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.2 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 2 /*Spawn Count*/, roundDuration,
                4000 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.2 * BattleArena.DifficultyMultiplier);
            break;

        case 4:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 4 /*Spawn Count*/, roundDuration,
                5600 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.4 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, 2 /*Spawn Count*/, roundDuration,
                3600 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.2 * BattleArena.DifficultyMultiplier);
            break;

        case 5:
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, 4 /*Spawn Count*/, roundDuration,
                4200 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.5 * BattleArena.DifficultyMultiplier);
            break;

        case 6:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 3 /*Spawn Count*/, roundDuration,
                3800 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.5 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_ZIPPINGFISH, 4 /*Spawn Count*/, roundDuration,
                6500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.3 * BattleArena.DifficultyMultiplier);
            break;

        case 7:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 2 /*Spawn Count*/, roundDuration,
                3500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.5 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_ZIPPINGFISH, 3 /*Spawn Count*/, roundDuration,
                5500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.5 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_MERGINGFISH, 3 /*Spawn Count*/, roundDuration,
                6500 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.5 * BattleArena.DifficultyMultiplier);
            break;

        case 8:
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, 3 /*Spawn Count*/, roundDuration,
                3200 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.6 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_CHARGINGFISH, 2 /*Spawn Count*/, roundDuration,
                3400 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.6 * BattleArena.DifficultyMultiplier);
            break;

        case 9:
            AddSpawnTimer(arena, FISHNAME_HOMINGFISH, 2 /*Spawn Count*/, roundDuration,
                4500 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.8 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_CHARGINGFISH, 3 /*Spawn Count*/, roundDuration,
                5100 * BattleArena.SpawnIntervalMultiplier, 0.99 /*Interval Modification Factor*/, 1.8 * BattleArena.DifficultyMultiplier);
            AddSpawnTimer(arena, FISHNAME_REGULARFISH, 3 /*Spawn Count*/, roundDuration,
                4500 * BattleArena.SpawnIntervalMultiplier, 0.98 /*Interval Modification Factor*/, 1.8 * BattleArena.DifficultyMultiplier);
            break;

        default: // Variable spawning
            var numberOfSpawnEvents = Math.sqrt(BattleArena.CurrentRound) * 2;
            for (var i = 0; i < numberOfSpawnEvents; i++) {
                let randomNumber = Math.floor(Math.random() * 5);
                let intervalModificationFactor = 1.0 - i * 0.01;
                let difficulty = 1.0 + (BattleArena.CurrentRound - i) / 5;

                let enemyType: string;
                let spawnMultiplier: number;
                let baseInterval: number;
                switch (randomNumber) {
                    case 0:
                        enemyType = FISHNAME_REGULARFISH;
                        spawnMultiplier = 2;
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
                        spawnMultiplier = 2;
                        baseInterval = 6600;
                        break;
                    case 4:
                        enemyType = FISHNAME_CHARGINGFISH;
                        spawnMultiplier = 1;
                        baseInterval = 6400;
                        break;
                    default:
                        break;
                }

                AddSpawnTimer(arena, enemyType, spawnMultiplier, roundDuration,
                    (baseInterval + i * 100) * BattleArena.SpawnIntervalMultiplier, intervalModificationFactor, difficulty * BattleArena.DifficultyMultiplier);
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
    const STOPSPAWNTIME = 3000;

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


