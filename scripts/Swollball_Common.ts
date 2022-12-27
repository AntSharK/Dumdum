declare var BallData: ServerBallData[];
declare var RoundScoreData: ServerRoundScoreData[];
declare var RoundLog: RoundEvent[];
declare var Game: Swollball_Lobby_Game;
declare var RoundNumber: integer;
declare var connection;

/* 
RECEIVE DATA FROM SERVER AND SEND STUFF BACK TO SERVER
 * */
function InitializeBallData(dataIn: any[]) {
    BallData = [];
    RoundLog = [];

    for (let data of dataIn) {
        var serverData = new ServerBallData();
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

function InitializeLeaderboardData(dataIn: any[]) {
    RoundScoreData = [];
    for (let data of dataIn) {
        var serverData = new ServerRoundScoreData();
        serverData.PlayerName = data.playerName;
        serverData.TotalScore = data.totalScore;
        serverData.RoundScore = data.roundScore;
        serverData.RoundDamageDone = data.roundDamageDone;
        serverData.RoundDamageReceived = data.roundDamageReceived;

        RoundScoreData.push(serverData);
    }

    if (dataIn.length > 0) {
        RoundNumber = dataIn[0].roundNumber;
    }
}

function SceneTransition(sceneFrom: string, sceneTo: string) {
    var activeScene = Game.game.scene.getScene(sceneFrom);
    var nextScene = Game.game.scene.getScene(sceneTo);
    activeScene.scene.switch(sceneTo);

    // Only restart scenes if they have run before
    if (nextScene.time.now > 0) {
        nextScene.scene.restart();
    }
}

class ServerBallData {
    SizeMultiplier: number;
    VelocityMultiplier: number;
    Damage: integer;
    Armor: integer;
    Color: number;
    Hp: integer;
    Name: string;
}

class ServerRoundScoreData {
    TotalScore: integer;
    RoundScore: integer;
    RoundDamageDone: integer;
    RoundDamageReceived: integer;
    PlayerName: string;
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

/*
HELPERS FOR GAME LOGIC
 * */
class PlayerBall extends Phaser.Physics.Arcade.Sprite {
    Size: number;
    Color: number;
    Armor: integer;
    Damage: integer;
    Hp: integer;
    MaxHp: integer;
    Text: Phaser.GameObjects.Text;
    SizeMultiplier: number;
    VelocityMultiplier: number;
}

function DisableBall(ball: PlayerBall) {
    ball.active = false;
    ball.Text.setVisible(false);
}

function CopyBallData(newBall: PlayerBall, data: ServerBallData) {
    newBall.Color = data.Color;
    newBall.Hp = data.Hp;
    newBall.MaxHp = data.Hp;
    newBall.Damage = data.Damage;
    newBall.Armor = data.Armor;
    newBall.SizeMultiplier = data.SizeMultiplier;
    newBall.VelocityMultiplier = data.VelocityMultiplier;
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
        CopyBallData(newBall, data);
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
    for (let pb of playerBalls) {
        if (pb.active) {
            var hp = Math.min(pb.Hp, pb.MaxHp);
            var colorAlpha = Phaser.Math.Interpolation.Linear([0.3, 1.0], hp / pb.MaxHp);
            graphics.fillStyle(pb.Color, colorAlpha);
            graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);
            graphics.lineStyle(10, 0x000000, colorAlpha);
            graphics.strokeCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size - 5)
            pb.Text.x = pb.body.position.x + pb.Size * 0.25;
            pb.Text.y = pb.body.position.y + pb.Size * 0.95;
            pb.Text.alpha = colorAlpha;
        }
    };
}