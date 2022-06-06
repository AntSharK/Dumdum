class SimpleGame {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game(
            {
                width: 800,
                height: 800,
                type: Phaser.AUTO,

                physics: {
                    default: 'arcade',
                    arcade: {
                        debug: true
                    }
                },

                scene: [Main]
            });
    }
}

class Main extends Phaser.Scene {
    //logo: Phaser.GameObjects.Image
    graphics: Phaser.GameObjects.Graphics;

    balls: Phaser.Physics.Arcade.Group;

    preload() {
        //this.load.image('logo', 'content/sky.png');
        this.load.image('dummyimage', 'content/dummyimage.png');
    }

    create() {
        //this.logo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var arena = this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: -1,
            bounceY: -1,
        });

        var create = arena.createMultiple({
            quantity: 72,
            key: 'dummyimage',
        });

        Phaser.Actions.PlaceOnCircle(create, new Phaser.Geom.Circle(400, 400, 300));

        arena.children.each(function (b) {
            (<Phaser.Physics.Arcade.Sprite>b).setPushable(false);
            (<Phaser.Physics.Arcade.Sprite>b).setImmovable(true);
        });

        this.balls = this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,            
        });

        this.balls.defaults.setVelocityX = 125;
        this.balls.defaults.setVelocityY = 125;
        this.balls.create(300, 300, this.balls.defaultKey);

        this.balls.defaults.setVelocityX = -125;
        this.balls.defaults.setVelocityY = -105;
        this.balls.create(500, 500, this.balls.defaultKey);

        this.balls.children.each(function (b) {
            (<Phaser.Physics.Arcade.Sprite>b).setCircle(50);
        });

        this.physics.add.collider(this.balls, arena, (body1, body2) => {
            //body2.body.stop();
        });

        this.physics.add.collider(this.balls, this.balls, (body1, body2) => {
            console.log("COLLISION");
        });
    }

    update() {
        this.graphics.clear();

        this.graphics.lineStyle(50, 0xFF00FF);
        this.graphics.fillStyle(0xFF00FF);
        this.graphics.fillCircle(400, 400, 300);
        var ballOffset = 0;
        var drawFunction = (ball) => {
            this.graphics.fillStyle(0x00FF00 + (ballOffset * 255));
            ballOffset++;
            this.graphics.fillCircle(ball.body.position.x + 50, ball.body.position.y + 50, 50);
        };
        this.balls.children.each(drawFunction);
    }
}

window.onload = () => {
    var game = new SimpleGame();
};