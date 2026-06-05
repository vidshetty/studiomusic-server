const cacheName = "v11";


self.addEventListener("install", e => {
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(names => {
            for (let name of names) {
                if (name !== cacheName) {
                    caches.delete(name);
                }
            }
        })
    );
});

const callCache = async e => {

    const resp = await caches.match(e.request);
    if (resp) return resp;

    const cache = await caches.open(cacheName);
    const response = await fetch(e.request);
    
    try {
        await cache.put(e.request, response.clone())
    }
    catch(err) {
        console.log("error in request (sw)", err.request);
        console.log(err.message);
    }

    return response;

};

self.addEventListener("fetch", e => {
    const { url } = e.request;

    if (
        url.includes(".svg") ||
        url.includes(".png") ||
        url.includes(".css") ||
        url.includes(".js") ||
        url.includes("font") ||
        url.includes("googleusercontent") ||
        url === "https://studiomusic.app" ||
        url === "https://studiomusic.app/" ||
        url === "https://studiomusic.app/player" ||
        url === "https://player.studiomusic.app" ||
        url === "https://player.studiomusic.app/" ||
        url === "https://player.studiomusic.app/player"
        // url.includes("/player/album") ||
        // url.includes("/player/track") ||
        // url.includes("/player/search")
    ) {
        e.respondWith(callCache(e));
    } else {
        e.respondWith(fetch(e.request))
    }
});


// e.waitUntil(
//     caches.open(cacheName).then(cache => {
//         cache.add(url);
//     })
// );

// if (url.includes("songserver") && headers.has("range")) {
//     const newHeaders = {};
//     for (const each of headers.entries()) {
//         newHeaders[each[0]] = each[1];
//     }
//     newHeaders["allowaccess"] = "a";
//     e.respondWith(
//         fetch(url,{
//             method: "GET",
//             headers: newHeaders,
//             redirect: "follow"
//         })
//     );
// }