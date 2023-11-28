var connection = new signalR.HubConnectionBuilder().withUrl("/zombBombHub").build();

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

function ClearState() {
    sessionStorage.removeItem(RoomIdSessionStorageKey);
    sessionStorage.removeItem(UserIdSessionStorageKey);
    sessionStorage.removeItem(LeaderBoardDurationStorageKey);
    sessionStorage.removeItem(RoundDurationStorageKey);
}

function GenerateLink() {
    var sessionRoomId = sessionStorage.getItem(RoomIdSessionStorageKey);
    var baseUrl = window.location.origin;
    var joinRoomUrl = baseUrl + "/Zombbomb/Zombbomb_Player?RoomId=" + sessionRoomId;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", joinRoomUrl);
}