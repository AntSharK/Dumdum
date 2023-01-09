const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";
const LeaderBoardDurationStorageKey = "leaderboardduration";
const RoundDurationStorageKey = "roundduration";
var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("ClearState", () => ClearState());

connection.on("ShowError", function (errorMessage, shouldReload = false) {
    window.alert(errorMessage);
    if (shouldReload) {
        window.location.reload();
    }
});

connection.on("SceneTransition", function (sceneFrom, sceneTo) {
    SceneTransition(sceneFrom, sceneTo);
})

connection.on("UpdateBalls", function (ballData) {
    InitializeBallData(ballData);
});

connection.on("UpdateLeaderboard", function (leaderboardData) {
    InitializeLeaderboardData(leaderboardData);
});

connection.on("UpdateUpgrades", function (upgradeData, creditsLeft) {
    InitializeUpgradeData(upgradeData, creditsLeft);
});

function ClearState() {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
    sessionStorage.removeItem(UserIdSessionStorageKey);
    sessionStorage.removeItem(LeaderBoardDurationStorageKey);
    sessionStorage.removeItem(RoundDurationStorageKey);
}

var conditionalReload = function () {
    var sessionRoomId = sessionStorage.getItem("roomid");

    if (sessionRoomId != null) {
        var elements = document.getElementsByClassName("state");
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }

        document.getElementById("pageName").textContent = "RECONNECTING...";
        /* Refreshing will cause refreshes on game end, leaving the score screen pre-maturely
        setInterval(function () {
            var sessionRoomId = sessionStorage.getItem("roomid");
            if (sessionRoomId == null) {
                window.location.reload()
            }
        }, 10000)*/
    }
}

window.onload = conditionalReload;