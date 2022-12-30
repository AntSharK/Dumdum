const FINALSCOREDISPLAYDURATION = 30;

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
                width: "95%",
                height: "95%",
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
                    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
                    mode: Phaser.Scale.FIT,
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

    constructor() {
        super({ key: 'BallArena', active: false });
    }

    preload() {
        this.load.image('dummyimage', '/content/dummyimage.png');
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        // Initialize timer
        var roundDuration = sessionStorage.getItem("roundduration");
        this.roundTimer = new Phaser.Time.TimerEvent({ delay: parseInt(roundDuration) * 1000, callback: this.finishScene, callbackScope: this });
        this.time.addEvent(this.roundTimer);
        this.time.addEvent(new Phaser.Time.TimerEvent({ delay: 1000, callback: this.setBallVelocity, callbackScope: this }));
        this.timeLeftDisplay = this.add.text(0, 0, roundDuration.toString(), { color: 'White' });
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

    setBallVelocity() {
        SetBallVelocity(this.playerBalls, this);
    }

    update() {
        this.graphics.clear();
        DrawArena(this.graphics, this.arena);
        DrawBalls(this.graphics, this.playerBalls);
        this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();
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
                roundDurationSeconds = roundDurationSeconds * 3;
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