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
    ticks: number;

    constructor() {
        super({ key: 'TestScene', active: false, visible: false });
    }
    create() {
        this.ticks = 0;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.add.text(0, 0, "TEST SCREEN TRANSITION", { color: 'White' });

        this.time.addEvent({ delay: 2000, callback: this.sceneTransition, callbackScope: this })
    }

    update() {
        this.graphics.lineStyle(50, 0xFF00FF);
        this.graphics.fillStyle(0xFF0000);
        this.graphics.fillCircle(400 + this.ticks % 400, 400 + this.ticks % 400, 150);
        this.ticks++;
    }

    sceneTransition() {
        this.scene.restart();
        this.scene.switch("Main");
    }
}