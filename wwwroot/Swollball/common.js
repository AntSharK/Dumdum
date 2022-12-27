const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";
var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("ClearState", function () {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
    sessionStorage.removeItem(UserIdSessionStorageKey);
});

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

connection.on("UpdateUpgrades", function (upgradeData) {
    InitializeUpgradeData(upgradeData);
});