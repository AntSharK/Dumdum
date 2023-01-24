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
    readyTextScale: number;
    readyText: Phaser.GameObjects.Sprite;

    ROUNDDELAY: integer = 1500;
    READYDISPLAYTIME: integer = 1000;
    constructor() {
        super({ key: 'BallArena', active: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
        this.load.image('readytext', '/content/ui/readytext.png');
        this.load.image('fighttext', '/content/ui/fighttext.png');
        this.load.image('background', '/content/ui/circlearenalines.png');
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
            bounceX: 1,
            bounceY: 1,
            immovable: true,
        }), this.game.canvas);

        this.arena.Initialize();
        var backgroundImage = this.add.sprite(this.arena.XPos, this.arena.YPos, 'background');
        backgroundImage.setDepth(-1);
        backgroundImage.setDisplaySize(this.arena.Radius * 2.8, this.arena.Radius * 2.8);

        this.balls = this.physics.add.group({
            defaultKey: 'dummyimage',
            bounceX: 1,
            bounceY: 1,
            
        });

        const AREATAKENBYBALLS = 0.25;
        this.playerBalls = InitializeBalls(this.balls, this, AREATAKENBYBALLS);

        // Text is smaller when balls are bigger, to give players a sense of scale
        const BASESCALE = 2;
        this.readyTextScale = BASESCALE * this.playerBalls[0].Size / this.playerBalls[0].SizeMultiplier;
        this.readyText = this.add.sprite(this.arena.XPos, this.arena.YPos, 'readytext');
        this.readyText.setScale(this.readyTextScale);
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
                    RoundLog.push(new RoundEvent("KILL", ball2.NameText.text, ball1.NameText.text, this.roundTimer.elapsed /*Time of death*/));
                }

                if (ball2.Hp <= 0) {
                    DisableBall(ball2);
                    this.balls.remove(ball2);
                    RoundLog.push(new RoundEvent("KILL", ball1.NameText.text, ball2.NameText.text, this.roundTimer.elapsed /*Time of death*/));
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
        ShrinkArena(this.arena, this.roundTimer.getRemainingSeconds() * 4); // Shrink the arena to 75% the radius by the end of the round
    }

    update() {
        this.graphics.clear();
        DrawArena(this.graphics, this.arena);
        DrawBalls(this.graphics, this.playerBalls);

        if (!this.circlesMoving) { // Draw a circle for scale
            this.timeLeftDisplay.text = "Starting...";
            this.drawPreliminaryText();
        } else {
            this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();

            // Destroy text until it has faded away it has faded out
            if (this.readyText.active) {
                this.drawPreliminaryText();
            }
            if (this.readyText.alpha <= 0) {
                this.readyText.destroy();
            }
        }
    }

    drawPreliminaryText() {
        if (this.roundTimer.getElapsed() > this.READYDISPLAYTIME) {
            if (this.readyText.texture.key == 'readytext') {
                this.readyText.setTexture('fighttext');
            }

            // Interpolate and draw
            var interpolationPoint = (this.roundTimer.getElapsed() - this.READYDISPLAYTIME) / this.ROUNDDELAY;
            this.readyText.setScale(Phaser.Math.Interpolation.QuadraticBezier(interpolationPoint,
                this.readyTextScale, this.readyTextScale * 4, this.readyTextScale * 5));
            this.readyText.alpha = Phaser.Math.Interpolation.QuadraticBezier(interpolationPoint,
                1, 0.2, 0);
        }
    }

    finishScene() {
        var sessionRoomId = sessionStorage.getItem("roomid");

        for (let ball of this.playerBalls) {
            RoundLog.push(new RoundEvent("HEALTH", ball.NameText.text, "", ball.Hp));
        }

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
            case -1: // TODO - Proper endgame function to end round
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
            return b.HpLeft - a.HpLeft; // Sort in descending order - TODO: Display time of death and ranking
        })) {
            this.add.text(200, 200 + 50 * i, scoreData.PlayerName + " - HP LEFT:" + scoreData.HpLeft,
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

function ShrinkArena(arena: Arena, timeToDisappear: number) {
    arena.PhysicsGroup.children.each(function (b) {
        var xDiff = arena.XPos - (<Phaser.Physics.Arcade.Sprite>b).x;
        var yDiff = arena.YPos - (<Phaser.Physics.Arcade.Sprite>b).y;
        var direction = new Phaser.Math.Vector2(xDiff, yDiff);
        (<Phaser.Physics.Arcade.Sprite>b).setVelocity(direction.x / timeToDisappear, direction.y / timeToDisappear);
    });
}

function DrawArena(graphics: Phaser.GameObjects.Graphics, arena: Arena) {
    var xDiff = (<Phaser.Physics.Arcade.Sprite>arena.PhysicsGroup.children.entries[0]).x - arena.XPos;
    var yDiff = (<Phaser.Physics.Arcade.Sprite>arena.PhysicsGroup.children.entries[0]).y - arena.YPos;
    var drawnRadius = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    graphics.lineStyle(8, 0x000000);
    graphics.strokeCircle(arena.XPos, arena.YPos, drawnRadius + 4)
}