// Modifiers for solo running - mostly holds static variables
class SoloRun {
    static KeyboardDirection: [x: integer, y: integer] = [0, 0];
    static Enabled: boolean = false;

    static ConfigureDebug(scene: BattleArena) {
        // Spawn enemies
        scene.input.keyboard.on('keydown-Q', event => {
            Fish.SpawnFishes(scene, 1, scene.spawningRect, scene.fishes, scene.octopi, "starfish", 1);
        }, scene);
        scene.input.keyboard.on('keydown-W', event => {
            Fish.SpawnFishes(scene, 1, scene.spawningRect, scene.fishes, scene.octopi, "homingfish", 1);
        }, scene);
        scene.input.keyboard.on('keydown-E', event => {
            Fish.SpawnFishes(scene, 1, scene.spawningRect, scene.fishes, scene.octopi, "mergingfish", 1);
        }, scene);
        scene.input.keyboard.on('keydown-R', event => {
            Fish.SpawnFishes(scene, 1, scene.spawningRect, scene.fishes, scene.octopi, "zippingfish", 1);
        }, scene);
        scene.input.keyboard.on('keydown-T', event => {
            Fish.SpawnFishes(scene, 1, scene.spawningRect, scene.fishes, scene.octopi, "chargingfish", 1);
        }, scene);

        // Take damage
        scene.input.keyboard.on('keydown-Z', event => {
            for (let key in BattleArena.OctopiMap) {
                let octopus = BattleArena.OctopiMap[key];
                octopus.TakeDamage(100);
            }
        }, this);

        // Run down the clock
        scene.input.keyboard.on('keydown-X', event => {
            scene.roundTimer.elapsed += 5000;
        }, this);
    }

    static ConfigureKeyboard(scene: Phaser.Scene) {
        scene.input.keyboard.on('keydown-RIGHT', event => {
            SoloRun.KeyboardDirection[0] = 1;
        }, this);
        scene.input.keyboard.on('keyup-RIGHT', event => {
            SoloRun.KeyboardDirection[0] = 0;
        }, this);
        scene.input.keyboard.on('keydown-LEFT', event => {
            SoloRun.KeyboardDirection[0] = -1;
        }, this);
        scene.input.keyboard.on('keyup-LEFT', event => {
            SoloRun.KeyboardDirection[0] = 0;
        }, this);
        scene.input.keyboard.on('keydown-UP', event => {
            SoloRun.KeyboardDirection[1] = -1;
        }, this);
        scene.input.keyboard.on('keyup-UP', event => {
            SoloRun.KeyboardDirection[1] = 0;
        }, this);
        scene.input.keyboard.on('keydown-DOWN', event => {
            SoloRun.KeyboardDirection[1] = 1;
        }, this);
        scene.input.keyboard.on('keyup-DOWN', event => {
            SoloRun.KeyboardDirection[1] = 0;
        }, this);
    }

    static SoloRunStart(arena: BattleArena) {
        SoloRun.Enabled = true;
        SoloRun.ConfigureKeyboard(arena);

        arena.events.on('create', () => SoloRun.ConfigureKeyboard(arena)); // Re-configure keyboard on creation
        arena.events.on('update', () => SoloRun.ApplyKeyboardControls());
        arena.events.on('afterFinishRound', () => {
            document.getElementById("gamenotificationarea").hidden = true;
            document.getElementById("gamenotificationmessage").hidden = true;
        });
    }

    static ApplyKeyboardControls() {
        if (SoloRun.Enabled
            && (SoloRun.KeyboardDirection[0] != 0 || SoloRun.KeyboardDirection[1] != 0)) {

            for (let key in BattleArena.OctopiMap) {
                let soloOctopus = BattleArena.OctopiMap[key];

                // Ideally, running at 30FPS, we'll have to move at least OCTOPUSSPEED * 33 per update cycle since it's 33ms per cycle
                soloOctopus.desiredX = soloOctopus.x + SoloRun.KeyboardDirection[0] * soloOctopus.speed * 50;
                soloOctopus.desiredY = soloOctopus.y + SoloRun.KeyboardDirection[1] * soloOctopus.speed * 50;
            }
        }
    }
}

function ConfigureSolorunSignalRListening(signalRconnection: any) {
    // A combination of creating the room, joining the room, and starting the room
    signalRconnection.on("StartSoloRun", function (roomId: string,
        octopusData: Octopus) {
        // Room creationg logic
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);

        // Room joining
        sessionStorage.setItem(UserIdSessionStorageKey, octopusData.name);

        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.scene.setActive(true);
        battleArenaScene.spawnOctopus(octopusData);

        // Battle arena stuff
        SoloRun.SoloRunStart(battleArenaScene);

        // Start the game
        const DEFAULTNUMROUNDS = 20;
        battleArenaScene.startGame(DEFAULTNUMROUNDS);
    })
}