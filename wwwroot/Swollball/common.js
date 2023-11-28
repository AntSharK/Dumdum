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


connection.on("UpdateState", function (ballData,
    leaderboardData,
    upgradeData,
    creditsLeft,
    sceneToStartOn,
    sceneToTransitionFrom) {
    if (ballData != null) { InitializeBallData(ballData); }
    if (leaderboardData != null) { InitializeLeaderboardData(leaderboardData); }
    if (upgradeData != null) { InitializeUpgradeData(upgradeData, creditsLeft); }

    if (sceneToStartOn != null && sceneToTransitionFrom == null) {
        StartGame(sceneToStartOn);
    }
    else if (sceneToStartOn != null && sceneToTransitionFrom != null) {
        SceneTransition(sceneToTransitionFrom, sceneToStartOn);
    }
});

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

function GenerateLink() {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var baseUrl = window.location.origin;
    var joinRoomUrl = baseUrl + "/Swollball/Player?RoomId=" + sessionRoomId;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", joinRoomUrl);
}