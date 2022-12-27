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
            playerBall.setVelocity(0, 0); // Stop the balls from moving
            playerBall.body.position.set(this.scale.canvas.width / 2 - playerBall.Size,
                this.scale.canvas.height / 2 - playerBall.Size - (200 * scaleMultiplier));
        }

        this.draw();
    }

    update() {
        // TODO: Update stats if needed

    }

    draw() {
        this.graphics.clear();
        DrawBalls(this.graphics, this.playerBalls);
    }
}