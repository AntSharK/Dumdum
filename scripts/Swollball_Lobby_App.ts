/* 
GAME SCENES
 * */
class Swollball_Lobby_Game {
    game: Phaser.Game;
    constructor(sceneToStartOn: string) {
        var scenesToUse = [BallArena, Leaderboard];
        switch (sceneToStartOn) {
            case "BallArena":
                break;
            case "Leaderboard":
                scenesToUse = [Leaderboard, BallArena];
                break;
        }

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

                scene: scenesToUse,
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
class BallArena extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    balls: Phaser.Physics.Arcade.Group;
    playerBalls: PlayerBall[] = [];
    arena: Arena;

    // Timer things
    roundTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;
    circlesMoving: boolean;
    radiusForScale: number;

    ROUNDDELAY: integer = 1500;
    constructor() {
        super({ key: 'BallArena', active: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
        this.load.image('ylow', '/content/ylow.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        // Initialize timer
        var roundDuration = sessionStorage.getItem("roundduration");
        this.roundTimer = new Phaser.Time.TimerEvent({ delay: parseInt(roundDuration) * 1000 + this.ROUNDDELAY, callback: this.finishScene, callbackScope: this });
        this.time.addEvent(this.roundTimer);
        this.time.addEvent(new Phaser.Time.TimerEvent({ delay: this.ROUNDDELAY, callback: this.startBallsMoving, callbackScope: this }));
        this.timeLeftDisplay = this.add.text(0, 0, roundDuration.toString(), { color: 'White' });
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        this.timeLeftDisplay.scale = boundingDimension * 0.005;

        this.arena = new Arena(this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 2,
            bounceY: 2,
        }), this.game.canvas);

        this.arena.Initialize();
        var backgroundImage = this.add.sprite(this.arena.XPos, this.arena.YPos, 'ylow');
        backgroundImage.setDepth(-1);
        backgroundImage.setDisplaySize(this.arena.Radius * 2, this.arena.Radius * 2);

        this.balls = this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,            
        });

        const AREATAKENBYBALLS = 0.25;
        this.playerBalls = InitializeBalls(this.balls, this, AREATAKENBYBALLS);

        // The DUMMYBALL is a ball before the game, rendered to give players a sense of scale
        const DUMMYBALLSIZE = 100;
        this.radiusForScale = DUMMYBALLSIZE * this.playerBalls[0].Size / this.playerBalls[0].SizeMultiplier;
        this.circlesMoving = false;

        this.physics.add.collider(this.balls, this.arena.PhysicsGroup, (body1, body2) => {
            // This makes the balls collide with the arena
        });

        // This marshalls ball to ball collision
        this.physics.add.collider(this.balls, this.balls, (body1, body2) => {
            var ball1 = body1 as PlayerBall;
            var ball2 = body2 as PlayerBall;
            if (ball1.Hp != undefined && ball2.Hp != undefined) {
                HitBalls(ball1, ball2, this.time.now /*Pass in the time the ball was hit*/);
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

    startBallsMoving() {
        this.circlesMoving = true;
        SetBallVelocity(this.playerBalls, this);
    }

    update() {
        this.graphics.clear();
        DrawArena(this.graphics, this.arena);
        DrawBalls(this.graphics, this.playerBalls);

        if (!this.circlesMoving) { // Draw a circle for scale
            this.timeLeftDisplay.text = "Starting...";
            var interpolationPoint = this.roundTimer.getElapsed() / this.ROUNDDELAY;
            this.graphics.fillStyle(0x000000); 
            this.graphics.fillCircle(this.arena.XPos, this.arena.YPos,
                Phaser.Math.Interpolation.QuadraticBezier(interpolationPoint,
                    this.radiusForScale, this.radiusForScale * 0.995, 0));
        } else {
            this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();
        }
    }

    finishScene() {
        var sessionRoomId = sessionStorage.getItem("roomid");
        connection.invoke("FinishRound", RoundLog, sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }
}

/* 
GAME SCENES - LEADERBOARD
 * */
class Leaderboard extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;

    // Timer things
    roundTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'Leaderboard', active: false });
    }
    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var timerEndFunction = this.StartNextRound;
        var roundDurationSeconds = parseInt(sessionStorage.getItem("leaderboardduration"));
        switch (RoundNumber) {
            case 0:
                this.add.text(200, 100, "FIRST ROUND STARTING SOON...");
                roundDurationSeconds = roundDurationSeconds * 2;
                break;
            case -1:
                this.add.text(200, 100, "END OF GAME");
                roundDurationSeconds = FINALSCOREDISPLAYDURATION;
                timerEndFunction = this.EndGame;
                break;
            default:
                this.add.text(200, 100, "ROUND: " + RoundNumber);
                break;
        }

        // Initialize timer
        this.roundTimer = new Phaser.Time.TimerEvent({ delay: roundDurationSeconds * 1000, callback: timerEndFunction, callbackScope: this });
        this.time.addEvent(this.roundTimer);
        this.timeLeftDisplay = this.add.text(0, 0, roundDurationSeconds.toString(), { color: 'White' });
        var boundingDimension = Math.min(this.scale.canvas.width, this.scale.canvas.height);
        this.timeLeftDisplay.scale = boundingDimension * 0.005;

        // Totally temporary leaderboard drawing
        var i = 0;
        for (let scoreData of RoundScoreData.sort((a: ServerRoundScoreData, b: ServerRoundScoreData) => {
            return b.TotalScore - a.TotalScore; // Sort in descending order
        })) {
            this.add.text(200, 200+50*i, scoreData.PlayerName + " - Total:" + scoreData.TotalScore + " - This Round:" + scoreData.RoundScore,
                { color: 'White' });
            i++;
        }
    }

    update() {
        this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();
    }

    StartNextRound() {
        var sessionRoomId = sessionStorage.getItem("roomid");
        connection.invoke("StartNextLobbyRound", sessionRoomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    EndGame() {
        window.location.reload();
    }
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
        this.Radius = Math.min(this.XPos, this.YPos) * LINEARSCALEFACTOR;
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
    graphics.strokeCircle(arena.XPos, arena.YPos, arena.Radius + 10)
    // No need to fill in the arean with a background image
    //graphics.fillStyle(0xFFFFFF);
    //graphics.fillCircle(arena.XPos, arena.YPos, arena.Radius);
}