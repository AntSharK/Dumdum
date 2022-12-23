class SimpleGame {
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

                scene: [Main],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH
                },
            });
    }
}

class Main extends Phaser.Scene {
    //logo: Phaser.GameObjects.Image
    graphics: Phaser.GameObjects.Graphics;

    balls: Phaser.Physics.Arcade.Group;

    playerBalls: PlayerBall[] = [];

    preload() {
        this.load.image('dummyimage', 'content/dummyimage.png');
    }

    create() {
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

        var newBall = this.balls.create(300, 300, this.balls.defaultKey);
        newBall.setVelocityX(125);
        newBall.setVelocityY(125);
        newBall.Color = 0x00FFFF;
        newBall.Hp = 100;
        newBall.Size = newBall.Hp;
        newBall.Text = this.add.text(newBall.body.position.x, newBall.body.position.y, "LLABTSET", { color: 'Black' });
        this.playerBalls[0] = newBall;

        newBall = this.balls.create(500, 500, this.balls.defaultKey);
        newBall.setVelocityX(-125);
        newBall.setVelocityY(-105);
        newBall.Color = 0xFFFF00;
        newBall.Hp = 75;
        newBall.Size = newBall.Hp;
        newBall.Text = this.add.text(newBall.body.position.x, newBall.body.position.y, "TESTBALL", { color: 'Black' });
        this.playerBalls[1] = newBall;

        this.balls.children.each(function (b) {
            var pb = b as PlayerBall;
            (<Phaser.Physics.Arcade.Sprite>b).setCircle(pb.Size);
        });

        this.physics.add.collider(this.balls, arena, (body1, body2) => {
            //body2.body.stop();
        });

        this.physics.add.collider(this.balls, this.balls, (body1, body2) => {
            var ball1 = body1 as PlayerBall;
            var ball2 = body2 as PlayerBall;
            if (ball1 != null && ball2 != null) {
                ball1.Hp = ball1.Hp - 10;
                ball1.body.position.x += 5;
                ball1.body.position.y += 5;
                ball1.Size = ball1.Hp;

                ball2.Hp = ball2.Hp - 10;
                ball2.Size = ball2.Hp;
                ball2.body.position.x += 5;
                ball2.body.position.y += 5;

                ball1.setCircle(ball1.Size);
                ball2.setCircle(ball2.Size);
                console.log(ball1.Hp + " " + ball2.Hp);
            }
        });
    }

    update() {
        this.graphics.clear();

        // Draw the arena
        this.graphics.lineStyle(50, 0xFF00FF);
        this.graphics.fillStyle(0xFF00FF);
        this.graphics.fillCircle(400, 400, 300);

        var drawBall = (ball) => {
            var pb = ball as PlayerBall;

            this.graphics.fillStyle(pb.Color);
            this.graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);
            pb.Text.x = pb.body.position.x;
            pb.Text.y = pb.body.position.y + pb.Size;
        };
        this.balls.children.each(drawBall);
    }
}

class PlayerBall extends Phaser.Physics.Arcade.Sprite {
    Size: number;
    Color: number;
    Hp: integer;
    Text: Phaser.GameObjects.Text;
}

window.onload = () => {
    var game = new SimpleGame();
};