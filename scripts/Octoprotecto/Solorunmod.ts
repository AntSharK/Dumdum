// Modifiers for solo running - mostly holds static variables
class SoloRun {
    static KeyboardDirection: [x: integer, y: integer] = [0, 0];
    static Enabled: boolean = false;

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
        var startingWeapons = [
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
            { range: 225, spread: 0.4, projectileDamage: 19, projectileSpeed: 500, fireRate: 200 },
        ];

        // Create an object with the same properties as Octopus
        var octopusData = new Octopus("SoloPlayer",
            arena,
            arena.game.canvas.width / 2,
            arena.game.canvas.height / 2,
            0x00FFFF,
            0.1497,
            20,
            998,
            startingWeapons as Weapon[]);

        arena.spawnOctopus(octopusData);
        arena.events.on('update', () => SoloRun.ApplyKeyboardControls());

        /* Old logic to reload in solo mode is overwritten by general logic to end game when no one is alive
        signalRconnection.on("OctopusDeathNotification", function (totalPoints: integer, pointsToRespawn: integer) {
            clearState();
            window.alert("Unable to respawn in solo mode.");
            window.location.reload();
        }); */
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