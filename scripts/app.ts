declare var BallData: ServerData[];
declare var Game: SimpleGame;

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
                        debug: true
                    }
                },

                scene: [Main,
                    TestScene],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

class Main extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    balls: Phaser.Physics.Arcade.Group;
    playerBalls: PlayerBall[] = [];
    arena: Arena;

    constructor() {
        super({ key: 'Main', active: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        this.arena = new Arena(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: -1,
            bounceY: -1,
        }), this.game.canvas);

        this.arena.Initialize();

        this.balls = this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,            
        });

        this.playerBalls = InitializeBalls(this.balls, this);

        this.physics.add.collider(this.balls, this.arena.PhysicsGroup, (body1, body2) => {
            // This makes the balls collide with the arena
        });

        // This marshalls ball to ball collision
        this.physics.add.collider(this.balls, this.balls, (body1, body2) => {
            var ball1 = body1 as PlayerBall;
            var ball2 = body2 as PlayerBall;
            if (ball1 != null && ball2 != null) {
                ball1.Hp = ball1.Hp - 10;
                ball2.Hp = ball2.Hp - 10;

                /* Changing ball size based on HP
                ball1.body.position.x += 5;
                ball1.body.position.y += 5;
                ball1.Size = ball1.Hp;

                ball2.Size = ball2.Hp;
                ball2.body.position.x += 5;
                ball2.body.position.y += 5;
                */

                ball1.setCircle(ball1.Size);
                ball2.setCircle(ball2.Size);
                console.log(ball1.Hp + " " + ball2.Hp);

                if (ball1.Hp <= 0 || ball2.Hp <= 0) {
                    this.scene.restart();
                    this.scene.switch("TestScene");
                }
            }
        });
    }

    update() {
        this.graphics.clear();
        DrawArena(this.graphics, this.arena);
        DrawBalls(this.graphics, this.playerBalls);
    }
}

class TestScene extends Phaser.Scene {
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

function PassInBallData() {
    BallData = [];

    // TODO: Pass in ball data

    var serverData = new ServerData;
    serverData.Color = 11745079;
    serverData.Hp = 100;
    serverData.Name = "TEST";
    serverData.SizeMultiplier = 1.0;
    serverData.VelocityMultiplier = 1.0;
    serverData.Damage = 1;
    serverData.Armor = 0;
    BallData[0] = serverData;
}

class PlayerBall extends Phaser.Physics.Arcade.Sprite {
    Size: number;
    Color: number;
    Hp: integer;
    MaxHp: integer;
    Text: Phaser.GameObjects.Text;
}

class ServerData {
    SizeMultiplier: number;
    VelocityMultiplier: number;
    Damage: integer;
    Armor: integer;
    Color: number;
    Hp: integer;
    Name: string;
}

function InitializeBalls(ballGroup: Phaser.Physics.Arcade.Group, scene: Phaser.Scene): PlayerBall[] {
    var retVal: PlayerBall[] = [];

    // Set the scale multiplier for initial drawing - we assume a coordinate of 1000, and scale according to current canvas size
    // Autoscaling will take care of the rest
    for (let data of BallData) {
        var newBall = ballGroup.create(0, 0, ballGroup.defaultKey);

        newBall.setVelocityX(125);
        newBall.setVelocityY(125);
        newBall.Color = data.Color;
        newBall.Hp = data.Hp;
        newBall.MaxHp = data.Hp;
        newBall.Size = data.Hp;
        newBall.Text = scene.add.text(newBall.body.position.x, newBall.body.position.y, data.Name, { color: 'Black' });
        retVal[0] = newBall;
    }

    // Place balls in a circle
    Phaser.Actions.PlaceOnCircle(retVal, new Phaser.Geom.Circle(scene.scale.canvas.width / 2, scene.scale.canvas.height / 2, 400));

    ballGroup.children.each(function (b) {
        var pb = b as PlayerBall;
        (<Phaser.Physics.Arcade.Sprite>b).setCircle(pb.Size);
    });

    return retVal;
}

function DrawBalls(graphics: Phaser.GameObjects.Graphics, playerBalls: PlayerBall[]) {
    graphics.lineStyle(10, 0x000000);                        
    for (let pb of playerBalls) {
        graphics.strokeCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size)
        graphics.fillStyle(pb.Color, pb.Hp / 100);
        graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);
        pb.Text.x = pb.body.position.x;
        pb.Text.y = pb.body.position.y + pb.Size;
    };
}

class Arena {
    PhysicsGroup: Phaser.Physics.Arcade.Group;
    XPos: integer;
    YPos: integer;
    Radius: integer;

    constructor(physicsGroup: Phaser.Physics.Arcade.Group, canvas: HTMLCanvasElement) {
        this.PhysicsGroup = physicsGroup;
        this.XPos = canvas.width / 2;
        this.YPos = canvas.height / 2;
        this.Radius = Math.min(this.XPos, this.YPos) * 0.9;
    }

    public Initialize(): void {
        var create = this.PhysicsGroup.createMultiple({
            quantity: 180,
            key: 'dummyimage',
        });

        Phaser.Actions.PlaceOnCircle(create, new Phaser.Geom.Circle(this.XPos, this.YPos, this.Radius));

        this.PhysicsGroup.children.each(function (b) {
            (<Phaser.Physics.Arcade.Sprite>b).setPushable(false);
            (<Phaser.Physics.Arcade.Sprite>b).setImmovable(true);
        });
    }
}

function DrawArena(graphics: Phaser.GameObjects.Graphics, arena: Arena) {
    graphics.lineStyle(20, 0xFF00FF);                        
    graphics.fillStyle(0xFFFFFF);
    graphics.strokeCircle(arena.XPos, arena.YPos, arena.Radius)
    graphics.fillCircle(arena.XPos, arena.YPos, arena.Radius);
}