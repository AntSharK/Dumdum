﻿const RoomIdSessionStorageKey = "roomid";
const UserIdSessionStorageKey = "userid";
var connection = new signalR.HubConnectionBuilder().withUrl("/swollBallHub").build();

connection.start().catch(function (err) {
    return console.error(err.toString());
});

connection.on("ClearState", function () {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
    sessionStorage.removeItem(UserIdSessionStorageKey);
})

connection.on("ShowError", function (errorMessage) {
    window.alert(errorMessage);
});