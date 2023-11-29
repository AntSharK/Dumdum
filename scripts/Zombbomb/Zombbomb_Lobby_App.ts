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
                backgroundColor: '#000000',

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
    player: Player;

    desiredX: integer = 0;
    desiredY: integer = 0;
    moveDirection: Phaser.Math.Vector2;
    desiredRotation: number;
    rotateLeft: boolean;

    constructor() {
        super({ key: 'ZombbombArena', active: true });
    }

    preload() {
        this.load.image('zombie', '/content/Zombbomb/ghost.png');
        this.load.image('player', '/content/Zombbomb/pacman.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        this.player = this.add.sprite(500, 500, 'player');
        this.player.originX = this.player.width / 2;
        this.player.originY = this.player.height / 2;
        this.player.scale = 0.2;

        this.desiredX = this.player.x;
        this.desiredY = this.player.y;

        this.input.on('pointerdown', function (pointer) {
            this.desiredX = pointer.x;
            this.desiredY = pointer.y;
            this.moveDirection = new Phaser.Math.Vector2(this.desiredX - this.player.x, this.desiredY - this.player.y);
            this.moveDirection.normalize();

            this.desiredRotation = Math.atan2(this.moveDirection.y, this.moveDirection.x);
            this.rotateLeft = ((this.desiredRotation > this.player.rotation && this.desiredRotation - this.player.rotation < Math.PI)
                || (this.desiredRotation < this.player.rotation && this.player.rotation - this.desiredRotation > Math.PI)
            );
        }, this);
    }

    update() {
        if (Math.abs(this.desiredRotation - this.player.rotation) > 0.25) {
            if (this.rotateLeft) {
                this.player.rotation += 0.15;
            }
            else {
                this.player.rotation -= 0.15;
            }
        }
        else {
            if (Math.abs(this.desiredRotation - this.player.rotation) > 0.05) {
                if (this.rotateLeft) {
                    this.player.rotation += 0.035;
                }
                else {
                    this.player.rotation -= 0.035;
                }
            }

            if (Math.abs(this.desiredX - this.player.x) > 5) {
                this.player.x += this.moveDirection.x * 5;
            }

            if (Math.abs(this.desiredY - this.player.y) > 5) {
                this.player.y += this.moveDirection.y * 5;
            }
        }
    }
}

class Player extends Phaser.GameObjects.Sprite {

}