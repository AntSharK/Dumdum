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

                scene: [BallStats],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH
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

        var sessionRoomId = sessionStorage.getItem("userid");

        this.playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this);

        for (let playerBall of this.playerBalls) {
            playerBall.setVelocity(0, 0); // Stop the balls from moving
        }
    }

    update() {
        // TODO: Update stats if needed

        this.graphics.clear();
        DrawBalls(this.graphics, this.playerBalls);
    }
}