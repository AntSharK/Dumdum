/* 
GAME SCENES
 * */
class Zombbomb_Lobby_Game {
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

                scene: [ZombbombArena],
                backgroundColor: '#0000ff',

                scale: {
                    parent: "phaserapp",
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    //mode: Phaser.Scale.FIT,
                },
            });
    }
}

/* 
GAME SCENES - BALL ARENA
 * */
class ZombbombArena extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;

    x: integer = 0;
    y: integer = 0;

    constructor() {
        super({ key: 'ZombbombArena', active: true });
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
    }

    update() {
        this.graphics.clear();
        this.graphics.lineStyle(5, 0xffff00);
        this.graphics.strokeCircle(this.x, this.y, 100);
        this.x++;
        this.y++;
    }
}