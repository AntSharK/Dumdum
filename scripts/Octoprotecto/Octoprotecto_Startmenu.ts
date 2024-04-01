
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
            scene: [BattleArena, Octocontroller, Upgradescreen],
            scale: {
                mode: Phaser.Scale.ScaleModes.FIT,
                resizeInterval: 1,
                expandParent: true,
                autoCenter: 1
            },
            disableContextMenu: true,
            autoFocus: true,
        });
    }
}

window.onload = () => {
    signalRconnection = new signalR.HubConnectionBuilder().withUrl("/octoprotectoHub").build();
    signalRconnection.start().catch(function (err) {
        return console.error(err.toString());
    });

    ConfigureMenuSignalRListening(signalRconnection);
    ConfigureControllerSignalRListening(signalRconnection);
    ConfigureUpgradeMenuSignalRListening(signalRconnection);
    ConfigureHostSignalRListening(signalRconnection);
    ConfigureSolorunSignalRListening(signalRconnection);

    octoProtecto = new Octoprotecto();
    (document.getElementById("colorpicker") as HTMLInputElement).value = GetRandomColor();

    document.getElementById("hostgamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();
        document.getElementById("lobbywaitingforserver").hidden = false;

        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.scene.setActive(true);

        signalRconnection.invoke("CreateRoom", BattleArena.OctopiMoveBounds).catch(function (err) {
            return console.error(err.toString());
        });
    });

    document.getElementById("sologamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();

        var numRounds = (document.getElementById("numberofrounds") as HTMLInputElement).value;
        BattleArena.NumberOfRounds = parseInt(numRounds);

        signalRconnection.invoke("SolorunStart", BattleArena.OctopiMoveBounds).catch(function (err) {
            return console.error(err.toString());
        });
    });

    document.getElementById("startgamebutton").addEventListener("click", function (event) {
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        if (battleArenaScene.octopi.children.size <= 0) {
            window.alert("No players in game!");
            return;
        }

        var roomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        var numRounds = (document.getElementById("numberofrounds") as HTMLInputElement).value;
        if (roomId == null) {
            window.alert("Error: No room ID!");
            return;
        }

        hideLobbyMenu();
        battleArenaScene.startGame(parseInt(numRounds));
    });

    document.getElementById("joingamebutton").addEventListener("click", function (event) {
        hideLobbyMenu();
        document.getElementById("lobbyjoingamemenu").hidden = false;
    });

    document.getElementById("resetstatebutton").addEventListener("click", function (event) {
        clearState();
        window.location.reload();
    });

    document.getElementById("joinroombutton").addEventListener("click", function (event) {
        var roomIdIn = (document.getElementById("roomid") as HTMLInputElement).value;
        var playerNameIn = (document.getElementById("playername") as HTMLInputElement).value;
        var colorIn = (document.getElementById("colorpicker") as HTMLInputElement).value;

        // Client-side input validation
        if (roomIdIn?.length != 5) {
            window.alert("Invalid Room ID - Must be 5 letters.")
            return;
        }
        if (playerNameIn?.length <= 0) {
            window.alert("Player name must not be blank.")
            return;
        }

        hideLobbyMenu();
        document.getElementById("lobbywaitingforserver").hidden = false;
        signalRconnection.invoke("JoinRoom", roomIdIn, colorIn, playerNameIn).catch(function (err) {
            return console.error(err.toString());
        });
    });

    document.getElementById("upgradefinishedbutton").addEventListener("click", function (event) {
        var existingRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        var existingUserId = sessionStorage.getItem(UserIdSessionStorageKey);
        hideLobbyMenu();
        setUpgradeMenuHidden(true);
        document.getElementById("lobbywaitingforserver").hidden = false;
        signalRconnection.invoke("UpgradeDone", existingRoomId, existingUserId).catch(function (err) {
            return console.error(err.toString());
        });
        
        var controllerScene = octoProtecto.game.scene.getScene("Octocontroller") as Octocontroller;
        controllerScene.state = ControllerState.WaitingForSync;
    });
};

function ConfigureMenuSignalRListening(signalRconnection: any) {
    signalRconnection.on("ConnectionEstablished", function () {
        // Once SignalR connection is established, check if this is a session that needs reconnection
        var existingRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
        var existingUserId = sessionStorage.getItem(UserIdSessionStorageKey);
        if (existingRoomId != null) {
            // Hide UI elements
            hideLobbyMenu();
            document.getElementById("lobbywaitingforserver").hidden = false;
            document.getElementById("waitingmessage").textContent = "RECONNECTING TO ROOM: " + existingRoomId;

            // Try once to re-connect to server
            signalRconnection.invoke("Reconnect", existingRoomId, existingUserId).catch(function (err) {
                return console.error(err.toString());
            });

            clearState();
        }
        else {
            hideLobbyMenu();
            // Check query string for room id
            let urlParams = new URLSearchParams(document.location.search);
            urlParams.has("JoinRoomId") ?
                document.getElementById("lobbyjoingamemenu").hidden = false :
                document.getElementById("lobbymenuinitial").hidden = false;
            
        }
    })

    signalRconnection.on("RoomCreated", function (roomId: string) {
        hideLobbyMenu();
        sessionStorage.setItem(RoomIdSessionStorageKey, roomId);

        // This might be repetitive - in many cases the scene is already active
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.scene.setActive(true);

        document.getElementById("gameidtext").textContent = "" + roomId;

        // There are cases where the room creation on the server-side happens after the client has started the game
        if (battleArenaScene.roundTimer == null) { 
            document.getElementById("lobbyhostcontent").hidden = false;
        }
    });

    signalRconnection.on("ErrorJoiningRoom", function (errorMessage: string) {
        window.alert(errorMessage);
        hideLobbyMenu();
        document.getElementById("lobbyjoingamemenu").hidden = false;
    });

    signalRconnection.on("ClearState", function () {
        clearState();
    });

    signalRconnection.on("ShowError", function (errorMessage, shouldReload = false) {
        window.alert(errorMessage);
        if (shouldReload) {
            window.location.reload();
        }
    });

    signalRconnection.on("SpawnOctopus", function (octopus: Octopus) {
        var battleArenaScene = octoProtecto.game.scene.getScene("BattleArena") as BattleArena;
        battleArenaScene.spawnOctopus(octopus);
    })
}

function hideLobbyMenu() {
    var menuElements = document.getElementsByClassName("lobbymenu");
    [].forEach.call(menuElements, function (element, index, array) {
        element.hidden = true;
    });
}

function clearState() {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
    sessionStorage.removeItem(UserIdSessionStorageKey);
}

function GetRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function GenerateLink() {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var baseUrl = window.location.origin;
    var joinRoomUrl = baseUrl + "/Octoprotecto?JoinRoomId=" + sessionRoomId;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", joinRoomUrl);
}