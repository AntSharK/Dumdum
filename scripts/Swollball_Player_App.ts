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
    statsDisplay: Record<string, Phaser.GameObjects.Text>;
    constructor() {
        super({ key: 'TestScene', active: false, visible: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.statsDisplay = {};

        this.playerBalls = InitializeBalls(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
        }), this);

        // Get the scale multiplier, so we know where to put things
        const ASSUMEDSCALE = 1000;
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        var scaleMultiplier = boundingDimension / ASSUMEDSCALE;

        for (let playerBall of this.playerBalls) { // There should be only one ball
            playerBall.setVelocity(0, 0); // Balls in this display do not move
            playerBall.setPosition(this.scale.canvas.width / 2 - 300 * scaleMultiplier, this.scale.canvas.height / 2 - 210 * scaleMultiplier);
        }

        var playerBall = this.playerBalls[0];

        this.statsDisplay["hp"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["dmg"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["armor"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["velocity"] = this.add.text(0, 0, "", { color: 'Black' });
        this.statsDisplay["size"] = this.add.text(0, 0, "", { color: 'Black' });
        this.updateText();

        var textArray = [];
        for (let key in this.statsDisplay) {
            var stat = this.statsDisplay[key];
            stat.scale = boundingDimension * 0.004;
            textArray.push(stat);
        }

        Phaser.Actions.PlaceOnCircle(textArray, new Phaser.Geom.Circle(playerBall.x, playerBall.y - 35 * scaleMultiplier, playerBall.Size + 15 * scaleMultiplier), -0.8, 1.1);
    }

    update() {
        if (this.playerBalls != null) {
            this.updateText;
        }
        this.graphics.clear();
        DrawBalls(this.graphics, this.playerBalls);
    }

    updateText() {
        var playerBall = this.playerBalls[0];
        this.statsDisplay["hp"].text = "HP:" + playerBall.MaxHp.toString();
        this.statsDisplay["dmg"].text = "DMG:" + playerBall.Damage.toString();
        this.statsDisplay["armor"].text = "ARMOR:" + playerBall.Armor.toString();
        this.statsDisplay["velocity"].text = "SPEED:" + playerBall.VelocityMultiplier.toString();
        this.statsDisplay["size"].text = "SIZE:" + playerBall.SizeMultiplier.toString();
    }
}