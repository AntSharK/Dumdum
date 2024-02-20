
function ConfigureControllerSignalR(signalRconnection: any) {
    signalRconnection.on("InitializeNewPlayer", function (playerId: string, roomId: string, locationX: number, locationY: number, octopiMovementBounds: Phaser.Geom.Rectangle) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        sessionStorage.setItem(UserIdSessionStorageKey, playerId);

        // TODO: Initialize controller scene
    });
}