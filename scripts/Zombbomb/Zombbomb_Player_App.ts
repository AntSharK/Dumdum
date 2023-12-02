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

    constructor() {
        super({ key: 'ZombieControl', active: true });
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
    }

    update() {
        this.graphics.clear();

        if (this.input.mousePointer.isDown) {
            var pointerX = this.input.mousePointer.x;
            var pointerY = this.input.mousePointer.y;

            var center = new Phaser.Math.Vector2(this.game.canvas.width / 2, this.game.canvas.height / 2);
            var direction = new Phaser.Math.Vector2(pointerX - this.game.canvas.width / 2, pointerY - this.game.canvas.height / 2);

            direction.normalize();

            // 2.1 is the zombie speed and is consistent everywhere
            xLoc += direction.x * 2.1;
            yLoc += direction.y * 2.1;
            updateServerPosition();

            this.graphics.lineStyle(100, 0xff0000);
            this.graphics.lineBetween(pointerX, pointerY, this.game.canvas.width / 2, this.game.canvas.height / 2);
        }
    }
}