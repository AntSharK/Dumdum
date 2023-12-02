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

                scene: [ZombieControl],
                backgroundColor: '#000000',

                scale: {
                    parent: "phaserapp",
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    //mode: Phaser.Scale.FIT,
                },
            });
    }
}

var xLoc: number;
var yLoc: number;
var updateServerPosition: any;

/* 
GAME SCENES
 * */
class ZombieControl extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;    
    lastUpdateTime: number;
    constructor() {
        super({ key: 'ZombieControl', active: true });
    }

    preload() {
    }

    create() {
        this.lastUpdateTime = this.time.now;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
    }

    update() {
        var deltaTime = this.time.now - this.lastUpdateTime;
        this.lastUpdateTime = this.time.now;
        this.graphics.clear();

        if (this.input.activePointer.isDown) {
            var pointerX = this.input.activePointer.x;
            var pointerY = this.input.activePointer.y;
            var direction = new Phaser.Math.Vector2(pointerX - this.game.canvas.width / 2, pointerY - this.game.canvas.height / 2);

            direction.normalize();

            // The zombie speed needs to be the same everywhere
            const ZOMBIESPEED = 0.2;
            xLoc += direction.x * ZOMBIESPEED * deltaTime;
            yLoc += direction.y * ZOMBIESPEED * deltaTime;
            updateServerPosition();

            this.graphics.lineStyle(100, 0xff0000);
            this.graphics.lineBetween(pointerX, pointerY, this.game.canvas.width / 2, this.game.canvas.height / 2);
        }
    }
}