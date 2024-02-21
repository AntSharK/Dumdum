class Octocontroller extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    lastUpdateTime: number;
    color: number;
    readyForControl: boolean = false; // This boolean means that the server and client have synchronized and control is ready
    bounds: Phaser.Geom.Rectangle;
    locationX: number;
    locationY: number;
    speed: number;

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
    }

    update() {
        if (!this.readyForControl) return; // Abort if state is not synchronized

        var deltaTime = this.time.now - this.lastUpdateTime;

        // If deltatime is somehow lagging, don't bother with any input
        const MAXDELTATIME = 2000;
        if (deltaTime > MAXDELTATIME) deltaTime = 0;

        this.lastUpdateTime = this.time.now;
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

    SynchronizeProperties(locationX: number, locationY: number, octopiMovementBounds: Phaser.Geom.Rectangle, playerColor: number, speed: number) {
        this.readyForControl = true;
        this.color = playerColor;
        this.lastUpdateTime = this.time.now;
        this.bounds = octopiMovementBounds;
        this.locationX = locationX;
        this.locationY = locationY;
        this.speed = speed;
    }
}

function ConfigureControllerSignalRListening(signalRconnection: any) {
    signalRconnection.on("InitializeNewPlayer", function (playerId: string,
        roomId: string,
        locationX: number,
        locationY: number,
        octopiMovementBounds: Phaser.Geom.Rectangle,
        playerColor: number,
        speed: number) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        sessionStorage.setItem(UserIdSessionStorageKey, playerId);

        hideLobbyMenu();
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
        battleArenaScene.scene.transition({ target: "Octocontroller" });
        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.SynchronizeProperties(locationX, locationY, octopiMovementBounds, playerColor, speed);
    });
}