/* 
GAME SCENES
 * */
class Zombbomb_Player_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "100%",
                height: "97%",
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        debug: false
                    }
                },

                scene: [ZombieControl, RespawnControl],
                backgroundColor: '#000000',

                scale: {
                    parent: "phaserapp",
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    //mode: Phaser.Scale.FIT,
                },
            });
    }
}

var updateServerPosition: any;
var respawnPlayer: any;

// Configurations from server-side
var XLOC: number;
var YLOC: number;
var LEFTBOUND: number;
var RIGHTBOUND: number;
var TOPBOUND: number;
var BOTTOMBOUND: number;
var ZOMBIESPEED: number;
var RESPAWNTIME: number;
var READYFORCONTROL: boolean = false; // This boolean means that the server and client have synchronized and control is ready

function startRespawnTimer(game: Phaser.Game) {
    READYFORCONTROL = false;
    var activeScene = game.scene.getScene("ZombieControl");
    var nextScene = game.scene.getScene("RespawnControl");
    activeScene.scene.switch("RespawnControl");

    // Only restart scenes if they have run before
    if (nextScene.time.now > 0) {
        nextScene.scene.restart();
    }
}

/* 
GAME SCENES
 * */
class RespawnControl extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;

    respawnTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;
    canRespawn: boolean;

    constructor() {
        super({ key: 'RespawnControl', active: false });
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();

        this.respawnTimer = new Phaser.Time.TimerEvent({ delay: RESPAWNTIME, callback: this.showRespawnButton, callbackScope: this});
        this.time.addEvent(this.respawnTimer);
        this.timeLeftDisplay = this.add.text(0, 0, "", { color: 'White', fontSize: '50vw' });
    }

    update() {
        if (!this.canRespawn) {
            this.timeLeftDisplay.text = Math.ceil(this.respawnTimer.getRemainingSeconds()).toString();
        }
        else {
            if (this.input.activePointer.isDown) {
                this.canRespawn = false;
                this.timeLeftDisplay.setVisible(false);
                var nextScene = this.game.scene.getScene("ZombieControl");
                this.scene.switch("ZombieControl");

                // Only restart scenes if they have run before
                if (nextScene.time.now > 0) {
                    nextScene.scene.restart();
                }
                respawnPlayer();
            }
        }
    }

    showRespawnButton() {
        this.timeLeftDisplay.text = "RESPAWN";
        this.timeLeftDisplay.setStyle({ color: 'Red', fontSize: '18vw' })
        this.canRespawn = true;
    }
}

class ZombieControl extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;    
    lastUpdateTime: number;
    zombieColor: number;
    constructor() {
        super({ key: 'ZombieControl', active: true });
    }

    preload() {
    }

    create() {
        this.lastUpdateTime = this.time.now;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();

        this.zombieColor = parseInt(sessionStorage.getItem("zombiecolor").substr(1), 16);
    }

    update() {
        if (!READYFORCONTROL) return; // Abort if state is not synchronized

        var deltaTime = this.time.now - this.lastUpdateTime;

        // If deltatime is somehow lagging, don't bother with any input
        if (deltaTime > 2000) deltaTime = 0;

        this.lastUpdateTime = this.time.now;
        this.graphics.clear();


        this.graphics.fillStyle(this.zombieColor);
        this.graphics.fillCircle(this.game.canvas.width / 2, this.game.canvas.height / 2, 50);

        if (this.input.activePointer.isDown) {
            var pointerX = this.input.activePointer.x;
            var pointerY = this.input.activePointer.y;
            var direction = new Phaser.Math.Vector2(pointerX - this.game.canvas.width / 2, pointerY - this.game.canvas.height / 2);

            direction.normalize();

            // The zombie speed needs to be the same everywhere
            XLOC += direction.x * ZOMBIESPEED * deltaTime;
            YLOC += direction.y * ZOMBIESPEED * deltaTime;

            if (XLOC < LEFTBOUND) { XLOC = LEFTBOUND; }
            if (XLOC > RIGHTBOUND) { XLOC = RIGHTBOUND; }
            if (YLOC > BOTTOMBOUND) { YLOC = BOTTOMBOUND; }
            if (YLOC < TOPBOUND) { YLOC = TOPBOUND; }

            updateServerPosition();
            this.graphics.lineStyle(100, this.zombieColor);
            this.graphics.lineBetween(pointerX, pointerY, this.game.canvas.width / 2, this.game.canvas.height / 2);
        }
    }
}