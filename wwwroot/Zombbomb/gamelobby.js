/***
BUTTON CLICKS
***/
document.getElementById("createroombutton").addEventListener("click", function (event) {
    connection.invoke("CreateRoom").catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});