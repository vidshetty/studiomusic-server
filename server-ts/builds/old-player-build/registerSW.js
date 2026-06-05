if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
    .then(res => {
        console.log("registered-player-sw");
        res.update()
        .then(() => {
            console.log("updated to latest!");
        });
    })
    .catch(err => console.log("error"));
}