var ISDEBUG: boolean = false;

class BattleArena extends Phaser.Scene {
    static OctopiMap: { [id: string]: Octopus } = {};
    static LeaderboardData: { [id: string]: OctopusTrackedData[] } = {};

    static CurrentRound: integer = 1;
    static NumberOfRounds: integer = 1;
    static OctopiMoveBounds: Phaser.Geom.Rectangle;

    graphics: Phaser.GameObjects.Graphics;
    spawningRect: Phaser.Geom.Rectangle;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    roundTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'BattleArena', active: false, visible: true });
    }

    preload() {
        this.load.image('ocean', '/content/Octoprotecto/ocean.jpg');
        this.load.image('octopus', '/content/Octoprotecto/ghost.png');
        this.load.image(FISHNAME_REGULARFISH, '/content/Octoprotecto/star.png');
        this.load.image(FISHNAME_HOMINGFISH, '/content/Octoprotecto/pacman.png');
        this.load.image(FISHNAME_MERGINGFISH, '/content/Octoprotecto/cyborgfish.png');
        this.load.image(FISHNAME_ZIPPINGFISH, '/content/Octoprotecto/greenfish.png');
        this.load.image(FISHNAME_CHARGINGFISH, '/content/Octoprotecto/stingray.png');
        this.load.image('dummy', '/content/Octoprotecto/dummy.png');
        this.load.image('bullet', '/content/Octoprotecto/bullet.png');
        this.load.image('fin', '/content/Octoprotecto/fin.png');

        // Particles
        this.load.image('particle_green1', '/content/Octoprotecto/green.png');
        this.load.image('particle_green2', '/content/Octoprotecto/greenbubble.png');
        this.load.image('particle_green3', '/content/Octoprotecto/green-orb.png');

        // Sprite sheets
        this.load.spritesheet('explosion', '/content/Octoprotecto/explosionframes.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        // Refresh game scale
        this.scale.setGameSize(OCTOPROTECTOCANVASWIDTH, OCTOPROTECTOCANVASHEIGHT);
        this.scale.refresh();
        this.scale.updateBounds();
        this.physics.world.setBounds(0, 0, OCTOPROTECTOCANVASWIDTH, OCTOPROTECTOCANVASHEIGHT, true, true, true, true);

        var background = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'ocean');
        background.displayWidth = this.game.canvas.width;
        background.displayHeight = this.game.canvas.height;
        background.depth = -1;
        this.spawningRect = new Phaser.Geom.Rectangle(50, 50, this.game.canvas.width - 100, this.game.canvas.height - 100);
        var octopusImage = this.textures.get("octopus").getSourceImage();
        BattleArena.OctopiMoveBounds = new Phaser.Geom.Rectangle(octopusImage.width / 2, octopusImage.height / 2, this.game.canvas.width - octopusImage.width, this.game.canvas.height - octopusImage.height);

        this.anims.create({
            key: 'explosion_anim',
            frames: this.anims.generateFrameNumbers('explosion', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }),
            frameRate: 20,
            repeat: 0
        })

        this.octopi = this.physics.add.group({
            defaultKey: 'octopus',
            immovable: true,
        });

        this.fishes = this.physics.add.group({
            defaultKey: 'fish',
            immovable: false,
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true
        });

        this.weapons = this.physics.add.group({
            defaultKey: 'dummy',
            immovable: true
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            immovable: false
        });

        this.physics.add.overlap(this.fishes, this.weapons, (body1, body2) => {
            var weapon = body2 as Weapon;
            var fish = body1 as Fish;
            if (!(fish.uniqueName in weapon.fishesInRange)) {
                weapon.fishesInRange[fish.uniqueName] = fish;
            }
        });

        this.physics.add.overlap(this.fishes, this.bullets, (body1, body2) => {
            var bullet = body2 as Bullet;
            var fish = body1 as Fish;
            bullet.ApplyHit(fish);
        });

        this.physics.add.overlap(this.fishes, this.octopi, (body1, body2) => {
            var octopus = body2 as Octopus;
            var fish = body1 as Fish;
            fish.HitOctopus(octopus);
        });

        this.physics.add.overlap(this.fishes, this.fishes, (body1, body2) => {
            var otherFish = body2 as Fish;
            var fish = body1 as Fish;
            fish.HitFish(otherFish);
        });

        // Initialize timer
        this.timeLeftDisplay = this.add.text(0, 0, "", { color: 'Red', fontSize: '5vw' });

        // DEBUG MODE THINGS - comment out in real cases
        if (ISDEBUG) {
            SoloRun.ConfigureDebug(this);
        }
    }

    startGame(numberOfRounds: integer) {
        BattleArena.NumberOfRounds = numberOfRounds;
        StartWave(this);
        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        signalRconnection.invoke("StartRoom", roomId).catch(function (err) {
            return console.error(err.toString());
        });
    }

    finishRound() {
        this.roundTimer = null;
        this.fishes.children.each(c => c.destroy());

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        hideGameNotifications();
        document.getElementById("gamenotificationarea").hidden = false;
        document.getElementById("gamenotificationmessage").hidden = false;

        // Fill in data of live octopi - to pipe back - these must be integers so they are accepted as integers on the server-side
        var pointsPerOctopus: { [id: string]: integer } = {};
        var damagePerWeapon: { [id: string]: integer } = {};

        for (let octopusName in BattleArena.OctopiMap) {
            let octopus = BattleArena.OctopiMap[octopusName];
            octopus.FinishRound();

            pointsPerOctopus[octopusName] = Math.round(octopus.points);
            for (let weaponName in octopus.weapons) {
                let weapon = octopus.weapons[weaponName];
                damagePerWeapon[weapon.name] = Math.round(weapon.damageDealt);
            }
        }

        if (BattleArena.CurrentRound >= BattleArena.NumberOfRounds) {
            DisplayEndGameLeaderboard();
            document.getElementById("gamenotificationmessage").textContent = "FINISHED GAME AT WAVE " + (BattleArena.CurrentRound);
            this.scene.setActive(false);
            clearState();
            setTimeout(() => window.location.reload(), 30000);

            signalRconnection.invoke("TriggerVictory", roomId).catch(function (err) {
                return console.error(err.toString());
            });

            return;
        }

        DisplayEndRoundLeaderboard();
        this.timeLeftDisplay.text = "ROUND " + (BattleArena.CurrentRound) + " FINISHED";
        document.getElementById("gamenotificationmessage").textContent = "ROUND " + (BattleArena.CurrentRound) + " FINISHED";

        BattleArena.CurrentRound++;
        signalRconnection.invoke("FinishRound", roomId, pointsPerOctopus, damagePerWeapon).catch(function (err) {
            return console.error(err.toString() + " - Params:" + roomId + "," + JSON.stringify(pointsPerOctopus) + "," + JSON.stringify(damagePerWeapon));
        });

        this.events.emit("afterFinishRound");
    }

    spawnOctopus(octopusData: Octopus) {
        var newOctopus = Octopus.FromData(octopusData, this);
        newOctopus.placeInScene(this, this.octopi, this.weapons, this.bullets, octopusData.tint);
        BattleArena.OctopiMap[octopusData.name] = newOctopus;

        if (!(newOctopus.name in BattleArena.LeaderboardData)) {
            BattleArena.LeaderboardData[newOctopus.name] = [];
        }
        if (!(BattleArena.CurrentRound in BattleArena.LeaderboardData[newOctopus.name])) {
            BattleArena.LeaderboardData[newOctopus.name][BattleArena.CurrentRound] = new OctopusTrackedData(newOctopus.displayName);
        }

        // Destroy any existing enemies in the spawning radius
        this.fishes.children.each(f => {
            var distance = Phaser.Math.Distance.BetweenPoints(f as Fish, newOctopus);
            if (distance < newOctopus.body.radius * 2) {
                (f as Fish).TakeDamage(99999); // Do a lot of damage on spawn
            }
        })
    }

    update() {
        this.graphics.clear();
        if (this.roundTimer != null) {
            this.timeLeftDisplay.text = Math.ceil(this.roundTimer.getRemainingSeconds()).toString();
        }

        for (let key in BattleArena.OctopiMap) {
            let octopus = BattleArena.OctopiMap[key];
            octopus.UpdateOctopus(this.graphics);
            if (octopus.invulnerable) {
                octopus.DrawFlash(this.graphics);
            }
            else {
                octopus.DrawDamageCircle(this.graphics);
            }
        }

        this.fishes.children?.each(f => {
            (f as Fish).updateFish();
        }, this);
    }

    CheckForLoss(): boolean {
        // If there is no roundtimer, then the game is not in arena mode
        if (this.roundTimer == null) {
            return;
        }

        var activeOctopi = this.octopi.countActive(true);
        if (activeOctopi > 0) { return false; }

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        signalRconnection.invoke("TriggerLoss", roomId).catch(function (err) {
            return console.error(err.toString());
        });

        DisplayEndGameLeaderboard();
        document.getElementById("gamenotificationmessage").textContent = "LOST AT WAVE " + BattleArena.CurrentRound;
        this.scene.setActive(false);
        clearState();
        setTimeout(() => window.location.reload(), 30000);
        return true;
    }
}

function DisplayEndRoundLeaderboard() {
    var table = document.getElementById("leaderboarddisplay") as HTMLTableElement;
    table.hidden = false;
    table.innerHTML = "";

    for (let playerName in BattleArena.LeaderboardData) {
        var currentRoundData = BattleArena.LeaderboardData[playerName][BattleArena.CurrentRound];
        let row = table.insertRow(0);
        row.insertCell(0).textContent = Math.round(currentRoundData.DamageTaken) + "";
        row.insertCell(0).textContent = Math.round(currentRoundData.DamageDealt) + "";
        row.insertCell(0).textContent = Math.round(currentRoundData.PointsGained) + "";
        row.insertCell(0).textContent = currentRoundData.DisplayName;
    }

    let row = table.insertRow(0);
    row.insertCell(0).textContent = "DMG TAKEN";
    row.insertCell(0).textContent = "DMG DEALT";
    row.insertCell(0).textContent = "POINTS";
    row.insertCell(0).textContent = "NAME";
}

function DisplayEndGameLeaderboard() {
    hideGameNotifications();
    document.getElementById("gamenotificationmessage").hidden = false
    document.getElementById("gamenotificationarea").hidden = false;

    var table = document.getElementById("leaderboarddisplay") as HTMLTableElement;
    table.hidden = false;
    table.innerHTML = "";

    for (let playerName in BattleArena.LeaderboardData) {
        var totalHealing = 0;
        var totalDmgTaken = 0;
        var totalDmgDealt = 0;
        var totalPoints = 0;
        for (let round in BattleArena.LeaderboardData[playerName]) {

            var currentRoundData = BattleArena.LeaderboardData[playerName][round];
            totalHealing += currentRoundData.HealingReceived;
            totalDmgTaken += currentRoundData.DamageTaken;
            totalDmgDealt += currentRoundData.DamageDealt;
            totalPoints += currentRoundData.PointsGained;
        }

        let row = table.insertRow(0);
        row.insertCell(0).textContent = Math.round(totalHealing) + "";
        row.insertCell(0).textContent = Math.round(totalDmgTaken) + "";
        row.insertCell(0).textContent = Math.round(totalDmgDealt) + "";
        row.insertCell(0).textContent = Math.round(totalPoints) + "";
        row.insertCell(0).textContent = currentRoundData.DisplayName;
    }

    let row = table.insertRow(0);
    row.insertCell(0).textContent = "HEALING";
    row.insertCell(0).textContent = "DMG TAKEN";
    row.insertCell(0).textContent = "DMG DEALT";
    row.insertCell(0).textContent = "POINTS";
    row.insertCell(0).textContent = "NAME";
}

function ConfigureHostSignalRListening(signalRconnection: any) {
    signalRconnection.on("UpdatePosition", function (playerId, x, y) {
        let targetOctopus = BattleArena.OctopiMap[playerId] as Octopus;
        if (targetOctopus != null) {
            targetOctopus.desiredX = x;
            targetOctopus.desiredY = y;
        }        
    });

    signalRconnection.on("StartNextRound", function () {
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        hideLobbyMenu();
        hideGameNotifications();
        StartWave(battleArenaScene);
    })
}

function hideGameNotifications() {
    var menuElements = document.getElementsByClassName("gamenotification");
    [].forEach.call(menuElements, function (element, index, array) {
        element.hidden = true;
    });
}

class OctopusTrackedData {
    PointsGained: number = 0;
    DamageDealt: number = 0;
    DamageTaken: number = 0;
    HealingReceived: number = 0;
    TimesDead: number = 0;
    DisplayName: string;

    constructor(displayName: string) {
        this.DisplayName = displayName;
    }

    static OctopusDies(octopus: Octopus) {
        BattleArena.LeaderboardData[octopus.name][BattleArena.CurrentRound].TimesDead++;
    }

    static TakeDamage(octopus: Octopus, damageTaken: number) {
        BattleArena.LeaderboardData[octopus.name][BattleArena.CurrentRound].DamageTaken += damageTaken;
    }

    static ReceiveHealing(octopus: Octopus, healingReceived: number) {
        BattleArena.LeaderboardData[octopus.name][BattleArena.CurrentRound].HealingReceived += healingReceived;
    }

    static GainPoints(octopus: Octopus, pointsGained: number) {
        BattleArena.LeaderboardData[octopus.name][BattleArena.CurrentRound].PointsGained += pointsGained;
    }

    static DealDamage(octopus: Octopus, damageDealt: number) {
        BattleArena.LeaderboardData[octopus.name][BattleArena.CurrentRound].DamageDealt += damageDealt;
    }
}