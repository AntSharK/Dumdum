
var octoProtecto: Octoprotecto;
var battleArenaScene: BattleArena;

var signalRconnection: any;
declare const signalR;

const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";

class Octoprotecto {
    game: Phaser.Game;
    constructor() {
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            physics: {
                default: 'arcade',
                arcade: {
                    //debug: true
                }
            },

            parent: 'octoprotectogame',
            width: 1024,
            height: 768,
            backgroundColor: '#FFFFFF',
            transparent: false,
            clearBeforeRender: false,
            scene: [BattleArena, Octocontroller],
            scale: {
                mode: Phaser.Scale.ScaleModes.FIT,
                resizeInterval: 1,
            },
            disableContextMenu: true,
            autoFocus: true,
        });
    }
}

window.onload = () => {
    octoProtecto = new Octoprotecto();
    signalRconnection = new signalR.HubConnectionBuilder().withUrl("/octoprotectoHub").build();
    signalRconnection.start().catch(function (err) {
        return console.error(err.toString());
    });

    (document.getElementById("colorpicker") as HTMLInputElement).value = GetRandomColor();

    ConfigureMenuSignalR(signalRconnection);
    ConfigureControllerSignalR(signalRconnection);

    document.getElementById("hostgamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();
        battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.scene.setActive(true);
        document.getElementById("lobbyhostcontent").hidden = false;
        signalRconnection.invoke("CreateRoom", battleArenaScene.octopiMoveBounds).catch(function (err) {
            return console.error(err.toString());
        });
    });

    document.getElementById("sologamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();
        battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.scene.setActive(true);
        battleArenaScene.startGame(true);
    });

    document.getElementById("startgamebutton").addEventListener("click", function (event) {
        if (battleArenaScene.octopi.children.size <= 0) {
            window.alert("No players in game!");
            return;
        }

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        if (roomId == null) {
            window.alert("Error: No room ID!");
            return;
        }

        hideLobbyMenu();
        battleArenaScene.startGame(false);
    });

    document.getElementById("joingamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();
        document.getElementById("lobbyjoingamemenu").hidden = false;
    });

    document.getElementById("joinroombutton").addEventListener("click", function (event) {
        var roomIdIn = (document.getElementById("roomid") as HTMLInputElement).value;
        var colorIn = (document.getElementById("colorpicker") as HTMLInputElement).value;
        hideLobbyMenu();
        document.getElementById("lobbywaitingforserver").hidden = false;
        signalRconnection.invoke("JoinRoom", roomIdIn, colorIn).catch(function (err) {
            return console.error(err.toString());
        });
    });
};

function ConfigureMenuSignalR(signalRconnection: any) {
    signalRconnection.on("RoomCreated", function (roomId: string) {
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);
        document.getElementById("gameidtext").textContent = "ROOM: " + roomId;
    });

    signalRconnection.on("ErrorJoiningRoom", function (errorMessage: string) {
        window.alert(errorMessage);
        hideLobbyMenu();
        document.getElementById("lobbyjoingamemenu").hidden = false;
    });

    signalRconnection.on("ClearState", function () {
        sessionStorage.removeItem(RoomIdSessionStorageKey);
        sessionStorage.removeItem(UserIdSessionStorageKey);
    });

    signalRconnection.on("ShowError", function (errorMessage, shouldReload = false) {
        window.alert(errorMessage);
        if (shouldReload) {
            window.location.reload();
        }
    });

    signalRconnection.on("SpawnOctopus", function (playerId: string, color: number, startX: number, startY: number) {
        battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.spawnOctopus(playerId, color, startX, startY);
    })
}

function hideLobbyMenu() {
    var menuElements = document.getElementsByClassName("lobbymenu");
    [].forEach.call(menuElements, function (element, index, array) {
        element.hidden = true;
    });
}

function GetRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}