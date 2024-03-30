class BattleArena extends Phaser.Scene {
    static OctopiMap: { [id: string]: Octopus } = {};

    graphics: Phaser.GameObjects.Graphics;
    spawningRect: Phaser.Geom.Rectangle;
    octopiMoveBounds: Phaser.Geom.Rectangle;

    fishes: Phaser.Physics.Arcade.Group;
    octopi: Phaser.Physics.Arcade.Group;
    weapons: Phaser.Physics.Arcade.Group;
    bullets: Phaser.Physics.Arcade.Group;

    roundTimer: Phaser.Time.TimerEvent;
    timeLeftDisplay: Phaser.GameObjects.Text;
    currentRound: integer = 1;
    numberOfRounds: integer;

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
        this.load.spritesheet('explosion', '/content/Octoprotecto/explosionframes.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });

        var background = this.add.sprite(this.game.canvas.width / 2, this.game.canvas.height / 2, 'ocean');
        background.displayWidth = this.game.canvas.width;
        background.displayHeight = this.game.canvas.height;
        background.depth = -1;
        this.spawningRect = new Phaser.Geom.Rectangle(50, 50, this.game.canvas.width - 100, this.game.canvas.height - 100);
        var octopusImage = this.textures.get("octopus").getSourceImage();
        this.octopiMoveBounds = new Phaser.Geom.Rectangle(octopusImage.width / 2, octopusImage.height / 2, this.game.canvas.width - octopusImage.width, this.game.canvas.height - octopusImage.height);

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
        SoloRun.ConfigureDebug(this);
    }

    startGame(soloRun: boolean, numberOfRounds: integer) {
        if (soloRun) {
            SoloRun.ConfigureKeyboard(this);
            SoloRun.SoloRunStart(this);
        }

        this.numberOfRounds = numberOfRounds;
        StartWave(this);
        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        signalRconnection.invoke("StartRoom", roomId, soloRun).catch(function (err) {
            return console.error(err.toString());
        });
    }

    finishRound() {
        this.roundTimer = null;
        this.fishes.children.each(c => c.destroy());
        this.currentRound++;

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        hideGameNotifications();
        document.getElementById("gamenotificationarea").hidden = false;
        document.getElementById("gamenotificationmessage").hidden = false;

        // Fill in data
        var pointsPerOctopus: { [id: string]: number } = {};
        var damagePerWeapon: { [id: string]: number } = {};

        for (let octopusName in BattleArena.OctopiMap) {
            let octopus = BattleArena.OctopiMap[octopusName];
            octopus.FinishRound();

            pointsPerOctopus[octopusName] = octopus.points;

            // TODO: Keep track of octopi which haven't respawned
            for (let weaponName in octopus.weapons) {
                let weapon = octopus.weapons[weaponName];
                damagePerWeapon[weapon.name] = weapon.damageDealt;
            }
        }

        if (this.currentRound > this.numberOfRounds) {
            DisplayEndGameLeaderboard();
            document.getElementById("gamenotificationmessage").textContent = "FINISHED GAME AT WAVE " + (this.currentRound - 1);
            this.scene.setActive(false);
            clearState();
            setTimeout(() => window.location.reload(), 30000);

            signalRconnection.invoke("TriggerVictory", roomId).catch(function (err) {
                return console.error(err.toString());
            });

            return;
        }

        DisplayEndRoundLeaderboard();
        this.timeLeftDisplay.text = "ROUND " + (this.currentRound - 1) + " FINISHED";
        document.getElementById("gamenotificationmessage").textContent = "ROUND " + (this.currentRound - 1) + " FINISHED";

        signalRconnection.invoke("FinishRound", roomId, pointsPerOctopus, damagePerWeapon).catch(function (err) {
            return console.error(err.toString());
        });
    }

    spawnOctopus(octopusData: Octopus) {
        var newOctopus = Octopus.FromData(octopusData, this);
        newOctopus.placeInScene(this, this.octopi, this.weapons, this.bullets, octopusData.tint);

        // TODO: Weapon damage dealt is lost when respawning
        BattleArena.OctopiMap[octopusData.name] = newOctopus;

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
        document.getElementById("gamenotificationmessage").textContent = "LOST AT WAVE " + this.currentRound;
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
    let row = table.insertRow(0);
    row.insertCell(0).textContent = "HP";
    row.insertCell(0).textContent = "POINTS";
    row.insertCell(0).textContent = "NAME";

    // TODO
}

function DisplayEndGameLeaderboard() {
    hideGameNotifications();
    document.getElementById("gamenotificationmessage").hidden = false
    document.getElementById("gamenotificationarea").hidden = false;

    var table = document.getElementById("leaderboarddisplay") as HTMLTableElement;
    table.hidden = false;
    table.innerHTML = "";
    let row = table.insertRow(0);
    row.insertCell(0).textContent = "DMG";
    row.insertCell(0).textContent = "POINTS";
    row.insertCell(0).textContent = "NAME";

    // TODO
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