class Swollball_Player_Game {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: "95%",
                height: "95%",
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        //debug: true
                    }
                },

                backgroundColor: '#EEEEEE',
                scene: [BallStats],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}
class BallStats extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    playerBalls: PlayerBall[];
    playerScore: ServerRoundScoreData;

    constructor() {
        super({ key: 'TestScene', active: false, visible: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        this.playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this);

        // Get the scale multiplier, so we know where to put things
        const ASSUMEDSCALE = 1000;
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = boundingDimension / ASSUMEDSCALE;

        for (let playerBall of this.playerBalls) {
            playerBall.setVelocity(0, 0); // Balls in this display do not move
            playerBall.setPosition(this.scale.canvas.width / 2, this.scale.canvas.height / 2 - 200 * scaleMultiplier);
        }
    }

    update() {
        // TODO: Update text stats
        this.draw();
    }

    draw() {
        this.graphics.clear();
        DrawBalls(this.graphics, this.playerBalls);
    }
}