declare var BallData: ServerBallData[];
declare var RoundScoreData: ServerRoundScoreData[];
declare var RoundLog: RoundEvent[];
declare var Game: Swollball_Lobby_Game;
declare var RoundNumber: integer;
declare var UpgradeData: ServerUpgradeData[];
declare var EconomyData: ServerEconomyData;
declare var connection;

const FINALSCOREDISPLAYDURATION = 30;
const LINEARSCALEFACTOR = 0.9;

declare var BallUpdateTime: number;
declare var LeaderboardUpdateTime: number;
declare var UpgradeUpdateTime: number;

/* 
RECEIVE DATA FROM SERVER AND SEND STUFF BACK TO SERVER
 * */
function InitializeBallData(dataIn: any[]) {
    BallUpdateTime = Date.now();
    BallData = [];
    RoundLog = [];

    for (let data of dataIn) {
        var serverData = new ServerBallData();
        serverData.PersistentUpgradeData = [];
        serverData.Armor = data.armor;
        serverData.Color = data.color;
        serverData.Damage = data.dmg;
        serverData.Hp = data.hp;
        serverData.Name = data.playerName;
        serverData.SizeMultiplier = data.sizeMultiplier;
        serverData.VelocityMultiplier = data.speedMultiplier;

        for (let persistentUpgradeData of data.persistentUpgradeData) {
            serverData.PersistentUpgradeData.push(ParseUpgradeData(persistentUpgradeData));
        }

        BallData.push(serverData);
    }
}

function InitializeLeaderboardData(dataIn: any[]) {
    LeaderboardUpdateTime = Date.now();
    RoundScoreData = [];
    var alivePlayers = 0;
    for (let data of dataIn) {
        var serverData = new ServerRoundScoreData();
        serverData.PlayerName = data.playerName;
        serverData.PointsLeft = data.pointsLeft;

        if (data.pointsLeft > 0) {
            alivePlayers++;
        }

        serverData.RoundDamageDone = data.roundDamageDone;
        serverData.RoundDamageReceived = data.roundDamageReceived;
        serverData.RoundNumber = data.roundNumber;
        serverData.PointsDeducted = data.pointsDeducted;
        serverData.TotalDamageDone = data.totalDamageDone;
        serverData.TotalDamageReceived = data.totalDamageReceived;

        RoundScoreData.push(serverData);
    }

    if (alivePlayers <= 1) {
        RoundNumber = -1;
    }
    else if (dataIn.length > 0) {
        RoundNumber = dataIn[0].roundNumber;
    }
}

function InitializeUpgradeData(dataIn: any[], economyData: any) {
    UpgradeUpdateTime = Date.now();
    UpgradeData = [];

    EconomyData = new ServerEconomyData();
    EconomyData.CreditsWereSpent = true;
    EconomyData.CreditsLeft = economyData.creditsLeft;
    EconomyData.MaxCredits = economyData.maxCredits;
    EconomyData.ShopSize = economyData.shopSize;
    EconomyData.ShopTier = economyData.shopTier;
    EconomyData.UpgradeTierCost = economyData.upgradeTierCost;

    for (let data of dataIn) {
        var serverData = ParseUpgradeData(data);
        UpgradeData.push(serverData);
    }
}

function ParseUpgradeData(data: any): ServerUpgradeData{
    var serverData = new ServerUpgradeData();
    serverData.UpgradeAmount = data.upgradeAmount;
    serverData.UpgradeName = data.upgradeName;
    serverData.Description = data.description;
    serverData.ServerId = data.serverId;
    serverData.BorderColor = data.borderColor
    serverData.FillColor = data.fillColor;
    serverData.Cost = data.cost;
    serverData.Tags = data.tags;

    return serverData;
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
    SizeMultiplier: integer;
    VelocityMultiplier: integer;
    Damage: integer;
    Armor: integer;
    Color: number;
    Hp: integer;
    Name: string;
    PersistentUpgradeData: ServerUpgradeData[];
}

class ServerRoundScoreData {
    PointsLeft: integer;
    RoundDamageDone: integer;
    RoundDamageReceived: integer;
    PlayerName: string;
    PointsDeducted: integer;
    RoundNumber: integer;
    TotalDamageDone: integer;
    TotalDamageReceived: integer;
}

class RoundEvent {
    EventName: string;
    AttackerId: string;
    ReceiverId: string;
    EventNumber: number;

    constructor(eventName: string, attacker: string, receiver: string, eventNumber: number) {
        this.EventName = eventName;
        this.AttackerId = attacker;
        this.ReceiverId = receiver;
        this.EventNumber = eventNumber;
    }
}

class ServerUpgradeData {
    UpgradeAmount: integer;
    UpgradeName: string;
    Description: string;
    ServerId: string;
    BorderColor: number;
    FillColor: number;
    Cost: integer;
    Tags: string[];
}

class ServerEconomyData {
    CreditsWereSpent: boolean;
    CreditsLeft: integer;
    MaxCredits: integer;
    ShopSize: integer;
    ShopTier: integer;
    UpgradeTierCost: integer;
}

/* 
 HELPERS FOR PERSISTENT UPGRADE ACTIONS
 */
function InitializePersistentUpgrades(ball: PlayerBall) {
    // Initialize upgrades which the client needs to know about
    ball.PersistentUpgradeActions = [];
    for (let persistentUpgradeData of ball.PersistentUpgradeData) {
        if (persistentUpgradeData.Tags.indexOf("Lifesteal") > -1) {
            ball.PersistentUpgradeActions.push(new FeastAction(persistentUpgradeData.UpgradeAmount));
        }

        if (persistentUpgradeData.Tags.indexOf("Reinforce") > -1) {
            ball.PersistentUpgradeActions.push(new HardenAction(persistentUpgradeData.UpgradeAmount));
        }
    }
}

interface PersistentUpgradeAction {
    Apply(owner: PlayerBall, target: PlayerBall, damageDone: number, damageTaken: number): void;
}

class FeastAction implements PersistentUpgradeAction {
    amount: number;
    constructor(amount: number) { this.amount = amount; }
    Apply(owner: PlayerBall, target: PlayerBall, damageDone: number, damageTaken: number): void {
        var stolen = damageDone * 0.1 * this.amount;
        owner.Hp = Math.min(owner.MaxHp, owner.Hp + stolen);
    }
}

class HardenAction implements PersistentUpgradeAction {
    amount: number;
    constructor(amount: number) { this.amount = amount; }
    Apply(owner: PlayerBall, target: PlayerBall, damageDone: number, damageTaken: number): void {
        owner.Armor += this.amount;
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
    NameText: Phaser.GameObjects.Text;
    HpText: Phaser.GameObjects.Text;
    SizeMultiplier: integer;
    VelocityMultiplier: integer;

    HitTime: number = 0;
    LastDisplayedHp: integer = 0;

    PersistentUpgradeData: ServerUpgradeData[];
    PersistentUpgradeActions: PersistentUpgradeAction[];
}

function HitBalls(ball1: PlayerBall, ball2: PlayerBall, timeNow: number) {
    // Invulnerability for a while after being hit
    const INVULNERABLETIME = 175;
    if (ball1.HitTime > 0
        && (timeNow - ball1.HitTime) < INVULNERABLETIME) {
        return;
    }
    if (ball2.HitTime > 0
        && (timeNow - ball2.HitTime) < INVULNERABLETIME) {
        return;
    }

    ball1.HitTime = timeNow;
    ball2.HitTime = timeNow;

    var damageDoneTo1 = Math.max(1, ball2.Damage - ball1.Armor);
    var damageDoneTo2 = Math.max(1, ball1.Damage - ball2.Armor);

    ball1.LastDisplayedHp = ball1.Hp;
    ball2.LastDisplayedHp = ball2.Hp;
    ball1.Hp = ball1.Hp - damageDoneTo1;
    ball2.Hp = ball2.Hp - damageDoneTo2;

    // Cap damage if it overkills
    if (ball1.Hp <= 0) {
        damageDoneTo1 = damageDoneTo1 + ball1.Hp;
    }

    if (ball2.Hp <= 0) {
        damageDoneTo2 = damageDoneTo2 + ball2.Hp;
    }

    if (ball1.Hp > 0) {
        for (let action of ball1.PersistentUpgradeActions) {
            action.Apply(ball1, ball2, damageDoneTo2, damageDoneTo1);
        }
    }

    if (ball2.Hp > 0) {
        for (let action of ball2.PersistentUpgradeActions) {
            action.Apply(ball2, ball1, damageDoneTo1, damageDoneTo2);
        }
    }

    RoundLog.push(new RoundEvent("DAMAGE", ball2.NameText.text, ball1.NameText.text, damageDoneTo1));
    RoundLog.push(new RoundEvent("DAMAGE", ball1.NameText.text, ball2.NameText.text, damageDoneTo2));
}

function DisableBall(ball: PlayerBall) {
    ball.active = false;
    ball.HpText.setVisible(false);
    ball.NameText.setVisible(false);
}

function CopyBallData(newBall: PlayerBall, data: ServerBallData) {
    newBall.Color = data.Color;
    newBall.Hp = data.Hp;
    newBall.MaxHp = data.Hp;
    newBall.Damage = data.Damage;
    newBall.Armor = data.Armor;
    newBall.SizeMultiplier = data.SizeMultiplier;
    newBall.VelocityMultiplier = data.VelocityMultiplier;
    newBall.PersistentUpgradeData = data.PersistentUpgradeData;
}

function InitializeBalls(ballGroup: Phaser.Physics.Arcade.Group, scene: Phaser.Scene, screenAreaTakenByBalls: number = 0.25): PlayerBall[] {
    var retVal: PlayerBall[] = [];

    // Set the scale multiplier for initial drawing - we assume a scale of 1000, and scale according to current canvas size
    // Autoscaling will take care of the rest
    const PLACERADIUS = 300;
    const FONTSIZEMULTIPLIER = 0.022;

    var boundingDimension = Math.min(scene.scale.canvas.width, scene.scale.canvas.height) * LINEARSCALEFACTOR;
    var scaleMultiplier = GetScale(scene);

    var totalBallArea = 0;
    for (let data of BallData) {
        totalBallArea += data.SizeMultiplier * data.SizeMultiplier;
    }

    var totalArenaArea = boundingDimension * boundingDimension;
    var desiredTotalBallArea = totalArenaArea * screenAreaTakenByBalls;
    var ballSizeBase = Math.sqrt(desiredTotalBallArea / totalBallArea) / 2;

    for (let data of BallData) {
        var newBall = ballGroup.create(0, 0, ballGroup.defaultKey) as PlayerBall;
        CopyBallData(newBall, data);
        newBall.Size = ballSizeBase * data.SizeMultiplier;

        newBall.NameText = scene.add.text(newBall.body.position.x, newBall.body.position.y, data.Name,
            { color: 'Black', font: 'Comic-Sans' });
        newBall.NameText.scale = newBall.Size * FONTSIZEMULTIPLIER;

        newBall.HpText = scene.add.text(newBall.body.position.x, newBall.body.position.y, data.Hp.toString(),
            { color: 'Black', font: 'Comic-Sans' });
        newBall.HpText.scale = newBall.Size * FONTSIZEMULTIPLIER;

        InitializePersistentUpgrades(newBall);

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

    var displayScale = playerBalls[0].Size / playerBalls[0].SizeMultiplier;

    // Velocity gets scaled by the displayed size of the balls
    var scaleMultiplier = GetScale(scene);
    for (let pb of playerBalls) {
        var direction = new Phaser.Math.Vector2(scene.scale.canvas.width / 2 - pb.x, scene.scale.canvas.height / 2 - pb.y);
        var normalizedDirection = direction.normalize();
        normalizedDirection.setAngle(normalizedDirection.angle() + (Math.random() * MAXDEFLECTIONANGLE * 2) - MAXDEFLECTIONANGLE);
        pb.setVelocityX(normalizedDirection.x * BASEVELOCITY * scaleMultiplier * pb.VelocityMultiplier * 0.01 * displayScale);
        pb.setVelocityY(normalizedDirection.y * BASEVELOCITY * scaleMultiplier * pb.VelocityMultiplier * 0.01 * displayScale);
    };

}

function DrawBalls(graphics: Phaser.GameObjects.Graphics, playerBalls: PlayerBall[]) {
    const FLASHTIME = 300;
    const FLASHINTERVAL = 70;
    const FLASHCHECK = 150;
    for (let pb of playerBalls) {
        if (pb.active) {
            var hp = Math.min(pb.Hp, pb.MaxHp);
            // Transparency is according to the bezier curve - 50% hp is 50% transparency
            var colorAlpha = Phaser.Math.Interpolation.QuadraticBezier(hp / pb.MaxHp, 0.15, 0.5, 1.0);

            if (pb.HitTime > 0
                && (graphics.scene.time.now - pb.HitTime) < FLASHTIME
                && (graphics.scene.time.now - pb.HitTime) % FLASHCHECK <= FLASHINTERVAL) {
                graphics.fillStyle(0xFFFFFF, 1);
            }
            else {
                graphics.fillStyle(pb.Color, colorAlpha);
            }

            // Update the HP displayed
            if (pb.HitTime > 0
                && (graphics.scene.time.now - pb.HitTime) < FLASHTIME
                && pb.HpText.text != pb.Hp.toString()) {
                // Change the HP slowly over FLASHTIME time
                pb.HpText.text = Math.ceil(Phaser.Math.Interpolation.Linear([pb.LastDisplayedHp, pb.Hp],
                    (graphics.scene.time.now - pb.HitTime) / FLASHTIME)).toString();
            }
            else {
                pb.HpText.text = Math.ceil(pb.Hp).toString();
            }

            graphics.fillCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size);

            // Line thickness is also modified by armor
            var lineThickness = Math.min(3 + pb.Armor/3, pb.Size/4);
            graphics.lineStyle(lineThickness, 0x000000, colorAlpha);
            graphics.strokeCircle(pb.body.position.x + pb.Size, pb.body.position.y + pb.Size, pb.Size - lineThickness / 2)

            // Align text to the center
            pb.NameText.x = pb.body.position.x + pb.Size * (1 - pb.NameText.text.length * 0.075);
            pb.NameText.y = pb.body.position.y + pb.Size * 0.95;
            //pb.NameText.alpha = colorAlpha;
            pb.HpText.x = pb.body.position.x + pb.Size * (1 - pb.HpText.text.length * 0.075);
            pb.HpText.y = pb.body.position.y + pb.Size * 1.15;
            //pb.HpText.alpha = colorAlpha;
        }
    };
}

function GetScale(scene: Phaser.Scene): number {
    const ASSUMEDSCALE = 1000;
    var boundingDimension = Math.min(scene.scale.canvas.width, scene.scale.canvas.height) * LINEARSCALEFACTOR;
    return (boundingDimension / ASSUMEDSCALE);
}

function RectDetection(rect: Phaser.Geom.Rectangle, x: number, y: number, gameObject: Phaser.GameObjects.GameObject): boolean {
    return (gameObject.scene.input.x >= rect.x
        && gameObject.scene.input.y >= rect.y
        && gameObject.scene.input.x <= rect.x + rect.width
        && gameObject.scene.input.y <= rect.y + rect.height);
}

function CircleDetection(circle: Phaser.Geom.Circle, x: number, y: number, gameObject: Phaser.GameObjects.GameObject): boolean {
    // Start with rectangle detection
    if (circle.left > gameObject.scene.input.x
        || circle.right < gameObject.scene.input.x
        || circle.top > gameObject.scene.input.y
        || circle.bottom < gameObject.scene.input.y) {
        return false;
    }

    var dx = (circle.x - gameObject.scene.input.x) * (circle.x - gameObject.scene.input.x);
    var dy = (circle.y - gameObject.scene.input.y) * (circle.y - gameObject.scene.input.y);

    return (dx + dy) <= (circle.radius * circle.radius);
}