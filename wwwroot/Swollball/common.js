﻿const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";
const LeaderBoardDurationStorageKey = "leaderboardduration";
const RoundDurationStorageKey = "roundduration";
var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("ClearState", ClearState());

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