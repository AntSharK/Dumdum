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
GAME SCENES - BALL ARENA
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
        this.input.on('pointerdown', function (pointer) {
            xLoc = pointer.x;
            yLoc = pointer.y;
            updateServerPosition();
        }, this);
    }

    update() {
    }
}