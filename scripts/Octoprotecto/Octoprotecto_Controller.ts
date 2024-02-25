class Octocontroller extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    lastUpdateTime: number;
    color: number;
    bounds: Phaser.Geom.Rectangle;
    locationX: number;
    locationY: number;
    speed: number;

    state: ControllerState = ControllerState.WaitingForSync;

    totalPoints: integer = 0;
    pointsToRespawn: integer = 0;

    respawnTimer: Phaser.Time.TimerEvent;
    respawnDisplay: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'Octocontroller' });
    }

    preload() {
    }

    create() {
        this.lastUpdateTime = this.time.now;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
        this.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.scale.refresh();
        this.respawnDisplay = this.add.text(0, 0, "", { color: 'White', fontSize: '5vw' });
    }

    update() {
        if (this.state == ControllerState.WaitingForSync) return; // Abort if state is not synchronized

        var deltaTime = this.time.now - this.lastUpdateTime;

        // If deltatime is somehow lagging, don't bother with any input
        const MAXDELTATIME = 2000;
        if (deltaTime > MAXDELTATIME) deltaTime = 0;

        this.lastUpdateTime = this.time.now;

        if (this.state == ControllerState.Movement) {
            this.HandleMovementInput(deltaTime);
            return;
        }

        if (this.state == ControllerState.WaitingForRespawn) {
            this.respawnDisplay.text = "RESPAWN IN: " + Math.ceil(this.respawnTimer.getRemainingSeconds()).toString();
            return;
        }

        if (this.state == ControllerState.ReadyToRespawn) {
            this.HandleRespawnInput();
            return;
        }
    }

    HandleRespawnInput() {
        if (this.input.activePointer.isDown) {
            if (this.pointsToRespawn <= this.totalPoints) {
                this.respawnDisplay.setVisible(false);
                this.state = ControllerState.WaitingForSync;

                signalRconnection.invoke("TriggerOctopusRespawn",
                    sessionStorage.getItem(RoomIdSessionStorageKey),
                    sessionStorage.getItem(UserIdSessionStorageKey)).catch(function (err) {
                        return console.error(err.toString());
                    });
            }
        }
    }

    ReadyForRespawn() {
        if (this.state == ControllerState.WaitingForRespawn) {
            this.state = ControllerState.ReadyToRespawn;

            if (this.pointsToRespawn <= this.totalPoints) {
                this.respawnDisplay.text = "CLICK TO RESPAWN. COST: " + this.pointsToRespawn + "/" + this.totalPoints;
            }
            else {
                this.respawnDisplay.text = "NOT ENOUGH POINTS. COST: " + this.pointsToRespawn + "/" + this.totalPoints;
            }
        }
    }

    HandleMovementInput(deltaTime: number) {
        this.graphics.clear();
        this.graphics.fillStyle(this.color);
        this.graphics.fillCircle(this.game.canvas.width / 2, this.game.canvas.height / 2, 50);

        if (this.input.activePointer.isDown) {
            var pointerX = this.input.activePointer.x;
            var pointerY = this.input.activePointer.y;
            var direction = new Phaser.Math.Vector2(pointerX - this.game.canvas.width / 2, pointerY - this.game.canvas.height / 2);

            direction.normalize();

            this.locationX += direction.x * this.speed * deltaTime;
            this.locationY += direction.y * this.speed * deltaTime;

            if (this.locationX < this.bounds.left) { this.locationX = this.bounds.left; }
            if (this.locationX > this.bounds.right) { this.locationX = this.bounds.right; }
            if (this.locationY > this.bounds.bottom) { this.locationY = this.bounds.bottom; }
            if (this.locationY < this.bounds.top) { this.locationY = this.bounds.top; }

            this.UpdateServerPosition();
            this.graphics.lineStyle(100, this.color);
            this.graphics.lineBetween(pointerX, pointerY, this.game.canvas.width / 2, this.game.canvas.height / 2);
        }
    }

    UpdateServerPosition() {
        signalRconnection.invoke("UpdateOctopusPosition",
            sessionStorage.getItem(RoomIdSessionStorageKey),
            sessionStorage.getItem(UserIdSessionStorageKey),
            this.locationX,
            this.locationY).catch(function (err) {
                return console.error(err.toString());
            });
    }

    ReadyForMovement(octopiMovementBounds: Phaser.Geom.Rectangle, octopusData: Octopus) {
        this.state = ControllerState.Movement;
        this.color = octopusData.tint;
        this.lastUpdateTime = this.time.now;
        this.bounds = octopiMovementBounds;
        this.locationX = octopusData.desiredX;
        this.locationY = octopusData.desiredY;
        this.speed = octopusData.speed;
    }
}

function ConfigureControllerSignalRListening(signalRconnection: any) {
    signalRconnection.on("InitializeNewPlayer", function (roomId: string,
        octopiMovementBounds: Phaser.Geom.Rectangle,
        octopusData: Octopus) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        sessionStorage.setItem(UserIdSessionStorageKey, octopusData.name);

        hideLobbyMenu();
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
        battleArenaScene.scene.transition({ target: "Octocontroller" });
        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.ReadyForMovement(octopiMovementBounds, octopusData);
    });

    signalRconnection.on("OctopusDeathNotification", function (totalPoints: integer, pointsToRespawn: integer,
        roomId: string, playerId: string) {  

        // The Room ID and player ID are only passed in when this is from a reconnect event
        if (roomId != null && playerId != null) {
            sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
            sessionStorage.setItem(UserIdSessionStorageKey, playerId);
            hideLobbyMenu();
            var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
            battleArenaScene.scene.transition({ target: "Octocontroller" });
        }

        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.state = ControllerState.WaitingForRespawn;
        controllerScene.respawnDisplay.setVisible(true);
        controllerScene.totalPoints = totalPoints;
        controllerScene.pointsToRespawn = pointsToRespawn;

        const RESPAWNTIME = 3000;
        controllerScene.graphics?.clear();
        controllerScene.respawnTimer = new Phaser.Time.TimerEvent({ delay: RESPAWNTIME, callback: () => controllerScene.ReadyForRespawn(), callbackScope: controllerScene });
        controllerScene.time.addEvent(controllerScene.respawnTimer);
    });

    signalRconnection.on("OctopusRespawn", function (octopiMovementBounds: Phaser.Geom.Rectangle, octopusData: Octopus) {
        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.ReadyForMovement(octopiMovementBounds, octopusData);
    });

    signalRconnection.on("LossNotification", function () {
        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.respawnDisplay.setVisible(false);
        controllerScene.add.text(0, 0, "YOU LOSE", { color: 'White', fontSize: '5vw' });
        controllerScene.state = ControllerState.WaitingForSync;
        controllerScene.scene.setActive(false);
        clearState();
        setTimeout(() => window.location.reload(), 10000);
    });

    signalRconnection.on("UpdateUpgrade", function (octopusData: Octopus,
        roomId: string, playerId: string) {

        // The Room ID and player ID are only passed in when this is from a reconnect event
        if (roomId != null && playerId != null) {
            sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
            sessionStorage.setItem(UserIdSessionStorageKey, playerId);
            hideLobbyMenu();
            var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
            battleArenaScene.scene.transition({ target: "Upgradescreen" });
        }

        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.state = ControllerState.WaitingForSync;
        controllerScene.scene.transition({ target: "Upgradescreen" });

        var upgradeScene = octoProtecto.game.scene.getScene("Upgradescreen") as Upgradescreen;
        upgradeScene.LoadOctopus(octopusData);
    })
}

enum ControllerState {
    WaitingForSync,
    Movement,
    WaitingForRespawn,
    ReadyToRespawn
}

class Upgradescreen extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    OctopusData: Octopus;
    MainBody: Phaser.GameObjects.Image;
    Tentacles: Phaser.GameObjects.Image[] = [];

    constructor() {
        super({ key: 'Upgradescreen' });
    }

    preload() {
    }

    create() {
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
        this.scale.setGameSize(window.innerWidth, window.innerHeight);
        this.scale.refresh();
    }

    update() {
    }

    LoadOctopus(octopusData: Octopus) {
        // Loading of data is independent of the actual sprite
        this.OctopusData = new Octopus(octopusData.name,
            this,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            octopusData.tint,
            octopusData.speed,
            octopusData.points,
            octopusData.maxHitPoints,
            octopusData.weapons);

        this.graphics.clear();
        this.MainBody = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "octopus");

        this.OctopusData.weapons.forEach(w => {
            this.Tentacles.push(this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "fin"));
        })

        // Add a dummy element to handle off-by-one placement
        var offByOne = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "fin");
        this.Tentacles.unshift(offByOne);
        Phaser.Actions.PlaceOnCircle(this.Tentacles, new Phaser.Geom.Circle(this.game.canvas.width / 2, this.game.canvas.height / 2, this.MainBody.width), 0, Math.PI);
        this.Tentacles.shift();
        offByOne.destroy();
    }
}