declare var BallData: ServerBallData[];
declare var RoundScoreData: ServerRoundScoreData[];
declare var RoundLog: RoundEvent[];
declare var Game: Swollball_Lobby_Game;
declare var RoundNumber: integer;
declare var CreditsLeft: integer;
declare var UpgradeData: ServerUpgradeData[];
declare var connection;

const FINALSCOREDISPLAYDURATION = 30;

/* 
RECEIVE DATA FROM SERVER AND SEND STUFF BACK TO SERVER
 * */
function InitializeBallData(dataIn: any[]) {
    BallData = [];
    RoundLog = [];

    for (let data of dataIn) {
        var serverData = new ServerBallData();
        serverData.KeystoneData = [];
        serverData.Armor = data.armor;
        serverData.Color = data.color;
        serverData.Damage = data.dmg;
        serverData.Hp = data.hp;
        serverData.Name = data.playerName;
        serverData.SizeMultiplier = data.sizeMultiplier;
        serverData.VelocityMultiplier = data.speedMultiplier;

        for (let keystoneData of data.keystoneData) {
            serverData.KeystoneData.push([keystoneData.item1, keystoneData.item2]);
        }

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

function InitializeUpgradeData(dataIn: any[], creditsLeft: integer) {
    UpgradeData = [];
    CreditsLeft = creditsLeft;
    for (let data of dataIn) {
        var serverData = new ServerUpgradeData();
        serverData.UpgradeAmount = data.upgradeAmount;
        serverData.UpgradeName = data.upgradeName;
        serverData.Description = data.description;
        serverData.ServerId = data.serverId;
        serverData.BorderColor = data.borderColor

        UpgradeData.push(serverData);
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
    KeystoneData: [string, integer][];
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

class ServerUpgradeData {
    UpgradeAmount: integer;
    UpgradeName: string;
    Description: string;
    ServerId: string;
    BorderColor: number;
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

    HitTime: number = 0;
    KeystoneData: [string, integer][];
}

function HitBalls(ball1: PlayerBall, ball2: PlayerBall, timeNow: number){
    ball1.HitTime = timeNow;
    ball2.HitTime = timeNow;

    var damageDoneTo1 = ball2.Damage - ball1.Armor;
    var damageDoneTo2 = ball1.Damage - ball2.Armor;

    ball1.Hp = ball1.Hp - damageDoneTo1;
    ball2.Hp = ball2.Hp - damageDoneTo2;

    RoundLog.push(new RoundEvent(ball2.Text.text, ball1.Text.text, damageDoneTo1));
    RoundLog.push(new RoundEvent(ball1.Text.text, ball2.Text.text, damageDoneTo2));
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
    newBall.KeystoneData = data.KeystoneData;
}

function InitializeBalls(ballGroup: Phaser.Physics.Arcade.Group, scene: Phaser.Scene): PlayerBall[] {
    var retVal: PlayerBall[] = [];

    // Set the scale multiplier for initial drawing - we assume a scale of 1000, and scale according to current canvas size
    // Autoscaling will take care of the rest
    const PLACERADIUS = 300;
    const FONTSIZEMULTIPLIER = 0.022;
    const AREATAKENBYBALLS = 0.25;

    var boundingDimension = Math.min(scene.scale.canvas.width, scene.scale.canvas.height);
    var scaleMultiplier = GetScale(scene);

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

    // Randomize the ball order
    retVal.sort(() => Math.random() - 0.5);

    // Place balls in a circle
    Phaser.Actions.PlaceOnCircle(retVal, new Phaser.Geom.Circle(scene.scale.canvas.width / 2, scene.scale.canvas.height / 2, PLACERADIUS * scaleMultiplier));
    for (let pb of retVal) {
        pb.setCircle(pb.Size);
        pb.body.setOffset(-pb.Size, -pb.Size);
    };

    return retVal;
}

function SetBallVelocity(playerBalls: PlayerBall[], scene: Phaser.Scene) {
    const BASEVELOCITY = 200;
    const MAXDEFLECTIONANGLE = 0.6;

    var scaleMultiplier = GetScale(scene);
    for (let pb of playerBalls) {
        var direction = new Phaser.Math.Vector2(scene.scale.canvas.width / 2 - pb.x, scene.scale.canvas.height / 2 - pb.y);
        var normalizedDirection = direction.normalize();
        normalizedDirection.setAngle(normalizedDirection.angle() + (Math.random() * MAXDEFLECTIONANGLE * 2) - MAXDEFLECTIONANGLE);
        pb.setVelocityX(normalizedDirection.x * BASEVELOCITY * scaleMultiplier);
        pb.setVelocityY(normalizedDirection.y * BASEVELOCITY * scaleMultiplier);
    };

}

function DrawBalls(graphics: Phaser.GameObjects.Graphics, playerBalls: PlayerBall[]) {
    const FLASHTIME = 300;
    const FLASHINTERVAL = 70;
    const FLASHCHECK = 150;
    for (let pb of playerBalls) {
        if (pb.active) {
            var hp = Math.min(pb.Hp, pb.MaxHp);
            //var colorAlpha = Phaser.Math.Interpolation.Linear([0.15, 1.0], hp / pb.MaxHp);
            var colorAlpha = Phaser.Math.Interpolation.QuadraticBezier(hp / pb.MaxHp, 0.10, 0.35, 1.0);

            if (pb.HitTime > 0
                && (graphics.scene.time.now - pb.HitTime) < FLASHTIME
                && (graphics.scene.time.now - pb.HitTime) % FLASHCHECK <= FLASHINTERVAL) {
                graphics.fillStyle(0xFFFFFF, 1);
            }
            else {
                graphics.fillStyle(pb.Color, colorAlpha);
            }

            graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);

            graphics.lineStyle(10, 0x000000, colorAlpha);
            graphics.strokeCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size - 5)

            pb.Text.x = pb.body.position.x + pb.Size * 0.25;
            pb.Text.y = pb.body.position.y + pb.Size * 0.95;
            pb.Text.alpha = colorAlpha;
        }
    };
}

function GetScale(scene: Phaser.Scene) : number {
    const ASSUMEDSCALE = 1000;
    var boundingDimension = Math.min(scene.scale.canvas.width, scene.scale.canvas.height);
    return (boundingDimension / ASSUMEDSCALE);
}

function RectDetection(rect: Phaser.Geom.Rectangle, x: number, y: number, gameObject: Phaser.GameObjects.GameObject): boolean {
    return (gameObject.scene.input.x >= rect.x
        && gameObject.scene.input.y >= rect.y
        && gameObject.scene.input.x <= rect.x + rect.width
        && gameObject.scene.input.y <= rect.y + rect.height);
}

function CircleDetection(circle: Phaser.Geom.Circle, x: number, y: number, gameObject: Phaser.GameObjects.GameObject): boolean {
    var dx = (circle.x - gameObject.scene.input.x) * (circle.x - gameObject.scene.input.x);
    var dy = (circle.y - gameObject.scene.input.y) * (circle.y - gameObject.scene.input.y);

    return (dx + dy) <= (circle.radius * circle.radius);
}