declare var BallData: ServerData[];
declare var RoundLog: RoundEvent[];
declare var Game: SimpleGame;
declare var connection;

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
                        debug: false
                    }
                },

                scene: [BallArena,
                    Leaderboard],

                scale: {
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
                },
            });
    }
}

class BallArena extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    balls: Phaser.Physics.Arcade.Group;
    playerBalls: PlayerBall[] = [];
    arena: Arena;

    roundTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;


    constructor() {
        super({ key: 'BallArena', active: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        const ROUNDDURATIONSECONDS = 10;
        this.roundTimer = new Phaser.Time.TimerEvent({ delay: ROUNDDURATIONSECONDS * 1000, callback: this.finishScene, callbackScope: this });
        this.time.addEvent(this.roundTimer);
        this.timeLeftDisplay = this.add.text(0, 0, ROUNDDURATIONSECONDS.toString(), { color: 'White' });
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        this.timeLeftDisplay.scale = boundingDimension * 0.005;

        this.arena = new Arena(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 2,
            bounceY: 2,
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
                var damageDoneTo1 = ball2.Damage - ball1.Armor;
                var damageDoneTo2 = ball1.Damage - ball2.Armor;
                ball1.Hp = ball1.Hp - damageDoneTo1;
                RoundLog.push(new RoundEvent(ball2.Text.text, ball1.Text.text, damageDoneTo1));
                ball2.Hp = ball2.Hp - damageDoneTo2;
                RoundLog.push(new RoundEvent(ball1.Text.text, ball2.Text.text, damageDoneTo2));

                if (ball1.Hp <= 0) {
                    DisableBall(ball1);
                    this.balls.remove(ball1);
                }

                if (ball2.Hp <= 0) {
                    DisableBall(ball2);
                    this.balls.remove(ball2);
                }

                if (this.balls.countActive() <= 1) {
                    this.finishScene();
                }
            }
        });
    }

    update() {
        this.graphics.clear();
        DrawArena(this.graphics, this.arena);
        DrawBalls(this.graphics, this.playerBalls);
        this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();
    }

    finishScene() {
        this.scene.restart();
        this.scene.switch("Leaderboard");

        // Invokes the call to the server
        var sessionRoomId = sessionStorage.getItem("roomid");
        connection.invoke("FinishRound", RoundLog, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

class Leaderboard extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    timer: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'Leaderboard', active: false, visible: false });
    }
    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.add.text(0, 0, "TEST SCREEN TRANSITION", { color: 'White' });

        this.timer = new Phaser.Time.TimerEvent({ delay: 2000, callback: this.sceneTransition, callbackScope: this });
        this.time.addEvent(this.timer);
    }

    update() {
        this.graphics.lineStyle(50, 0xFF00FF);
        this.graphics.fillStyle(0xFF0000);
        this.graphics.fillCircle(400 + this.timer.elapsed % 400, 400 + this.timer.elapsed % 400, 150);
    }

    sceneTransition() {
        this.scene.restart();
        this.scene.switch("BallArena");
    }
}

function InitializeBallData(dataIn: any[]) {
    BallData = [];
    RoundLog = [];

    for (let data of dataIn) {
        var serverData = new ServerData();
        serverData.Armor = data.armor;
        serverData.Color = data.color;
        serverData.Damage = data.dmg;
        serverData.Hp = data.hp;
        serverData.Name = data.playerName;
        serverData.SizeMultiplier = data.sizeMultiplier;
        serverData.VelocityMultiplier = data.speedMultiplier;

        BallData.push(serverData);
    }
}

class PlayerBall extends Phaser.Physics.Arcade.Sprite {
    Size: number;
    Color: number;
    Armor: integer;
    Damage: integer;
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

function DisableBall(ball: PlayerBall) {
    ball.active = false;
    ball.Text.setVisible(false);
}

function InitializeBalls(ballGroup: Phaser.Physics.Arcade.Group, scene: Phaser.Scene): PlayerBall[] {
    var retVal: PlayerBall[] = [];

    // Set the scale multiplier for initial drawing - we assume a scale of 1000, and scale according to current canvas size
    // Autoscaling will take care of the rest
    const ASSUMEDSCALE = 1000;
    const PLACERADIUS = 300;
    const FONTSIZEMULTIPLIER = 0.022;
    const BASEVELOCITY = 200;
    const MAXDEFLECTIONANGLE = 0.6;
    const AREATAKENBYBALLS = 0.25;

    var boundingDimension = Math.min(scene.scale.canvas.width, scene.scale.canvas.height);
    var scaleMultiplier = boundingDimension / ASSUMEDSCALE;

    var totalBallSize = 0;
    for (let data of BallData) {
        totalBallSize += data.SizeMultiplier * data.SizeMultiplier;
    }

    var ballSizeBase = boundingDimension / Math.sqrt(totalBallSize) * AREATAKENBYBALLS;

    for (let data of BallData) {
        var newBall = ballGroup.create(0, 0, ballGroup.defaultKey) as PlayerBall;
        newBall.Color = data.Color;
        newBall.Hp = data.Hp;
        newBall.MaxHp = data.Hp;
        newBall.Damage = data.Damage;
        newBall.Armor = data.Armor;
        newBall.Size = ballSizeBase * data.SizeMultiplier;

        newBall.Text = scene.add.text(newBall.body.position.x, newBall.body.position.y, data.Name, { color: 'Black', font: 'Comic-Sans' });
        newBall.Text.scale = newBall.Size * FONTSIZEMULTIPLIER;
        retVal.push(newBall);
    }

    // Place balls in a circle
    Phaser.Actions.PlaceOnCircle(retVal, new Phaser.Geom.Circle(scene.scale.canvas.width / 2, scene.scale.canvas.height / 2, PLACERADIUS * scaleMultiplier));
    for (let pb of retVal) {
        // Set the velocity
        var direction = new Phaser.Math.Vector2(scene.scale.canvas.width / 2 - pb.x, scene.scale.canvas.height / 2 - pb.y);
        var normalizedDirection = direction.normalize();
        normalizedDirection.setAngle(normalizedDirection.angle() + (Math.random() * MAXDEFLECTIONANGLE * 2) - MAXDEFLECTIONANGLE);
        pb.setVelocityX(normalizedDirection.x * BASEVELOCITY * scaleMultiplier);
        pb.setVelocityY(normalizedDirection.y * BASEVELOCITY * scaleMultiplier);

        // Offset the object
        pb.setCircle(pb.Size);
        pb.body.setOffset(-pb.Size, -pb.Size);
    };

    return retVal;
}

function DrawBalls(graphics: Phaser.GameObjects.Graphics, playerBalls: PlayerBall[]) {
    graphics.lineStyle(10, 0x000000);                        
    for (let pb of playerBalls) {
        if (pb.active) {
            graphics.fillStyle(pb.Color, pb.Hp / pb.MaxHp);
            graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);
            graphics.strokeCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size - 5)
            pb.Text.x = pb.body.position.x + pb.Size * 0.25;
            pb.Text.y = pb.body.position.y + pb.Size * 0.95;
        }
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

class RoundEvent {
    AttackerId: string;
    ReceiverId: string;
    DamageDone: integer;

    constructor(attacker: string, receiver: string, damage: number) {
        this.AttackerId = attacker;
        this.ReceiverId = receiver;
        this.DamageDone = damage;
    }
}