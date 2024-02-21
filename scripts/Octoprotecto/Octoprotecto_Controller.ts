class Octocontroller extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    lastUpdateTime: number;
    color: number;
    constructor() {
        super({ key: 'Octocontroller', active: true });
    }

    preload() {
    }

    create() {
        this.lastUpdateTime = this.time.now;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
    }

    update() {
    }
}

function ConfigureControllerSignalR(signalRconnection: any) {
    signalRconnection.on("InitializeNewPlayer", function (playerId: string, roomId: string, locationX: number, locationY: number, octopiMovementBounds: Phaser.Geom.Rectangle) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        sessionStorage.setItem(UserIdSessionStorageKey, playerId);

        // TODO: Initialize controller scene
        
    });
}