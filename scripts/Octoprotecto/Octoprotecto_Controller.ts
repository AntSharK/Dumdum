class Octocontroller extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    lastUpdateTime: number;
    color: number;
    constructor() {
        super({ key: 'Octocontroller' });
    }

    preload() {
    }

    create() {
        this.lastUpdateTime = this.time.now;
        this.graphics = this.add.graphics({ x: 0, y: 0 });
        this.input.mouse.disableContextMenu();
    }

    update() {
        console.log(this.lastUpdateTime);
    }
}

function ConfigureControllerSignalR(signalRconnection: any) {
    signalRconnection.on("InitializeNewPlayer", function (playerId: string, roomId: string, locationX: number, locationY: number, octopiMovementBounds: Phaser.Geom.Rectangle) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        sessionStorage.setItem(UserIdSessionStorageKey, playerId);

        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena");
        battleArenaScene.scene.transition({ target: "Octocontroller" });
    });
}