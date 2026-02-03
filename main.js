var blockClose = false;
window.onbeforeunload = function (e) {
    if (blockClose) {
        e = e || window.event;
        if (e) {
            e.returnValue = "Any string";
        }
        return "Any string";
    }
};

function menu(opt) {
    switch (opt) {
        case 0:
            if (document.getElementById("controls").style.display == "block") {
                document.getElementById("playOnly").style.display = "block";
            }
            document.getElementById("menu").style.display = "block";
            break;
    }
}

var rightclickMenu = document.getElementById("rightclick-menu");
document.addEventListener(
    "contextmenu",
    function (event) {
        if (!!event.target.closest('[class*="rightclick-activate"]')) {
            setupRightClick(event.target);
            event.preventDefault();
            var mouseX = event.clientX;
            var mouseY = event.clientY;
            var menuHeight = rightclickMenu.getBoundingClientRect().height;
            var menuWidth = rightclickMenu.getBoundingClientRect().width;
            var width = window.innerWidth;
            var height = window.innerHeight;
            if (width - mouseX <= 200) {
                rightclickMenu.style.borderRadius = "1vw 0 1vw 1vw";
                rightclickMenu.style.left = width - menuWidth + "px";
                rightclickMenu.style.top = mouseY + "px";

                if (height - mouseY <= 200) {
                    rightclickMenu.style.top = mouseY - menuHeight + "px";
                    rightclickMenu.style.borderRadius = "1vw 1vw 0 1vw";
                }
            } else {
                rightclickMenu.style.borderRadius = "0 1vw 1vw 1vw";
                rightclickMenu.style.left = mouseX + "px";
                rightclickMenu.style.top = mouseY + "px";

                if (height - mouseY <= 200) {
                    rightclickMenu.style.top = mouseY - menuHeight + "px";
                    rightclickMenu.style.borderRadius = "1vw 1vw 1vw 0";
                }
            }

            rightclickMenu.style.display = "block";
        }
    },
    { passive: false }
);

document.addEventListener("click", function (event) {
    rightclickMenu.style.display = "none";
    if (event.target.id != "menuButton") {
        document.getElementById("menu").style.display = "none";
    }
});

window.addEventListener("hashchange", function () {
    openAlert("URL has changed.", "You have changed the URL of this page. You must reload for changes to take effect.");
});

function setupRightClick(evt) {
    var songItem = event.target.closest(".rightclick-activate-song");
    if (evt.className.includes("rightclick-activate-playlist")) {
        var plId = Number(evt.id.split("customPlaylist")[1]);
        rightclickMenu.innerHTML = `<button class="w3-btn w3-ripple w3-round-xlarge btn1 rightclick-menu-item" onclick="renamePlaylist(${plId})">Rename playlist</button><br><button class="w3-btn w3-ripple w3-round-xlarge btn1 rightclick-menu-item" onclick="deletePlaylist(${plId})">Delete playlist</button><br>`;
    } else if (!!songItem) {
        if (videoList.length <= 1) {
            rightclickMenu.innerHTML = `<button class="w3-btn w3-disabled w3-round-xlarge btn1 rightclick-menu-item">You must have at least one song.</button><br>`;
        } else {
            var vidId = Number(songItem.id.split("titles")[1]);
            rightclickMenu.innerHTML = `<button class="w3-btn w3-ripple w3-round-xlarge btn1 rightclick-menu-item" onclick="removeSong(${vidId})">Remove song</button><br>`;
        }
    }
}
function openAlert(header, text) {
    var ranID;
    while (true) {
        ranID = Date.now() + Math.floor(Math.random() * 100000000000000000000);
        if (!document.getElementById("alert-" + ranID)) {
            break;
        }
    }
    setTimeout(function () {
        closeAlert(ranID);
    }, 10000);
    document.getElementById("alerts").innerHTML +=
        `<div class="alert" onclick="closeAlert(${ranID})" style="opacity:0;" id="alert-${ranID}"><span class="alertHead">${header}</span><br><span class="alertText">${text}</span><br><span class="closeAlert">Click to dismiss.</span></div>`;
    setTimeout(function () {
        document.getElementById("alert-" + ranID).style.opacity = 0.9;
    }, 100);
}
function closeAlert(ranID) {
    if (document.getElementById("alert-" + ranID)) {
        document.getElementById("alert-" + ranID).style.opacity = 0;
        setTimeout(function () {
            document.getElementById("alert-" + ranID).style.display = "block";
            document.getElementById("alert-" + ranID).remove();
        }, 300);
    }
}

function deletePlaylist(n) {
    localData.playlists.splice(n, 1);
    updateStorage();
    parsePlaylists();
}

function removeSong(n) {
    videoList.splice(n, 1);
    titles.splice(n, 1);
    authors.splice(n, 1);
    var oldSong = currentVideo;
    if (n < currentVideo) {
        currentVideo--;
        if (oldSong == n) {
            makeVideo();
        }
    } else {
        if (oldSong == n) {
            currentVideo--;
            makeVideo();
        }
    }
    document.getElementById("titleDisplay").innerHTML = "";
    updateTitles();
    highlightCurrent();
}

function renamePlaylist(n) {
    localData.playlists[n].name = prompt("New Name?");
    updateStorage();
    parsePlaylists();
}

function updateStorage() {
    localStorage.setItem("dataStorage", JSON.stringify(localData));
}

function changeTheme() {
    if (document.getElementById("theme").href.search("dark") == -1) {
        document.getElementById("theme").href = "themes/dark.css";
        document.getElementById("changeTheme").innerHTML = "Light theme";
        localData.theme = "dark";
        updateStorage();
    } else {
        document.getElementById("theme").href = "themes/light.css";
        document.getElementById("changeTheme").innerHTML = "Dark theme";
        localData.theme = "light";
        updateStorage();
    }
}

function changeLooping() {
    if (localData.looping == "true") {
        document.getElementById("changeLooping").innerHTML = "Enable looping";
        localData.looping = "false";
        updateStorage();
    } else {
        document.getElementById("changeLooping").innerHTML = "Disable looping";
        localData.looping = "true";
        updateStorage();
    }
}

function decipherPageLink() {
    var urlData = new URL(window.location.href).hash.substring(1).split(";");
    for (var i = 0; i < urlData.length; i++) {
        var param;
        if (urlData[i].includes("ytpl_playlist:")) {
            param = urlData[i].split("ytpl_playlist:")[1];
            if (param.includes("c")) {
                try {
                    param = Number(param.split("c")[1]);
                    if (document.getElementById("customPlaylist" + param)) {
                        customPlaylist(param);
                    } else {
                        throw "URL config value is incorrect. No such playlist exists.";
                    }
                } catch (err) {
                    openAlert(
                        "Invalid URL configuration.",
                        "The URL configuration value " + urlData[i] + " failed at decode with error: " + err + "."
                    );
                }
            } else {
                try {
                    param = Number(param);
                    if (document.getElementById("preset" + param)) {
                        preset(param);
                    } else {
                        throw "URL config value is incorrect. No such playlist exists.";
                    }
                } catch (err) {
                    openAlert(
                        "Invalid URL configuration.",
                        "The URL configuration value " + urlData[i] + " failed at decode with error: " + err
                    );
                }
            }
        } else if (urlData[i].includes("ytpl_theme:")) {
            param = urlData[i].split("ytpl_theme:")[1];
            if (param == "light") {
                localData.theme = "light";
            } else if (param == "dark") {
                localData.theme = "dark";
            } else {
                openAlert(
                    "Invalid URL configuration.",
                    "The URL configuration value " +
                        urlData[i] +
                        " failed at decode with error: No such theme exists. Options are 'dark' and 'light'."
                );
            }
        } else if (urlData[i].includes("ytpl_looping:")) {
            param = urlData[i].split("ytpl_looping:")[1];
            if (param == "on") {
                localData.looping = "true";
            } else if (param == "off") {
                localData.looping = "false";
            } else {
                openAlert(
                    "Invalid URL configuration.",
                    "The URL configuration value " +
                        urlData[i] +
                        " failed at decode with error: No such option exists. Options are 'on' and 'off'."
                );
            }
        } else if (urlData[i].includes("ytpl_shuffle")) {
            try {
                if (document.getElementById("playlist").value != "") {
                    shuffleList();
                } else {
                    openAlert(
                        "Invalid URL configuration.",
                        "The URL configuration value " +
                            urlData[i] +
                            " failed at decode with error: You can not 'shuffle' if you have not specified a playlist first."
                    );
                }
            } catch (err) {
                openAlert(
                    "Invalid URL configuration.",
                    "The URL configuration value " + urlData[i] + " failed at decode with error: " + err
                );
            }
        } else if (urlData[i].includes("ytpl_play_now")) {
            if (document.getElementById("playlist").value != "") {
                document.getElementById("main").style.display = "none";
                document.getElementById("clickNeeded").style.display = "block";
            } else {
                openAlert(
                    "Invalid URL configuration.",
                    "The URL configuration value " +
                        urlData[i] +
                        " failed at decode with error: You can not 'play now' if you have not specified a playlist first."
                );
            }
        } else {
            if (urlData[i].length > 0) {
                openAlert(
                    "Invalid URL configuration.",
                    "The URL configuration value '" +
                        urlData[i] +
                        "' could not be decoded. Current options can be found under Menu -> URL Configuration Help"
                );
            }
        }
    }
}
function urlHelp(opt) {
    switch (opt) {
        case 0:
            document.getElementById("urlHelp").style.display = "block";
            break;
        case 1:
            document.getElementById("urlHelp").style.display = "none";
            break;
    }
}

function clickNeeded() {
    document.getElementById("clickNeeded").style.display = "none";
    document.getElementById("main").style.display = "block";
    go();
}

function saveCurrentPlaylist(opt) {
    switch (opt) {
        case 0:
            document.getElementById("newPlaylist").style.display = "block";
            break;
        case 1:
            document.getElementById("newPlaylist").style.display = "none";
            break;
        case 2:
            try {
                if (document.getElementById("newPlaylistName").value != "") {
                    document.getElementById("newPlaylist").style.display = "none";
                    if (localData.playlists[0] == null) {
                        localData.playlists = [];
                    }
                    localData.playlists.push({
                        name: document.getElementById("newPlaylistName").value,
                        ids: videoList
                    });
                    updateStorage();
                    openAlert(
                        "Playlist saved.",
                        "The custom playlist '" + document.getElementById("newPlaylistName").value + "' was saved."
                    );
                } else {
                    openAlert("Enter a playlist name.", "You must enter a playlist name.");
                }
            } catch (err) {
                openAlert("Error.", "The following error occurred when saving: " + err);
            }
            break;
    }
}

function overwritePlaylist(opt) {
    switch (opt) {
        case 0:
            document.getElementById("toOverwrite").innerHTML = "";
            for (var i = 0; i < localData.playlists.length; i++) {
                var pName = localData.playlists[i].name;
                document.getElementById("toOverwrite").innerHTML +=
                    `<button class="w3-btn w3-round-xlarge w3-ripple btn2 rightclick-activate-playlist" onclick="overwritePlaylist('overwrite${i}')" id="overwritePlaylistButton${i}">${pName}</button>`;
            }
            document.getElementById("overwritePlaylist").style.display = "block";
            break;
        case 1:
            document.getElementById("overwritePlaylist").style.display = "none";
            break;
        default:
            try {
                opt = Number(opt.split("overwrite")[1]);
                var oldName = localData.playlists[opt].name;
                document.getElementById("overwritePlaylist").style.display = "none";
                localData.playlists[opt] = {
                    name: oldName,
                    ids: videoList
                };
                updateStorage();
                openAlert("Playlist overwritten.", "The custom playlist '" + oldName + "' was overwritten.");
            } catch (err) {
                openAlert("Error.", "The following error occurred when saving: " + err);
            }
            break;
    }
}

function importVideo(opt) {
    switch (opt) {
        case 0:
            document.getElementById("importVideo").style.display = "block";
            break;
        case 1:
            document.getElementById("importVideo").style.display = "none";
            break;
        case 2:
            /*try{
            if (document.getElementById("newPlaylistName").value != "") {
                document.getElementById("newPlaylist").style.display = "none";
                if (localData.playlists[0] == null) {
                    localData.playlists = [];
                }
                localData.playlists.push({ name: document.getElementById("newPlaylistName").value, ids: videoList });
                updateStorage();
                openAlert("Playlist saved.", "The custom playlist, " + document.getElementById("newPlaylistName").value + ", was saved.");
            }else{
                openAlert("Enter a playlist name.", "You must enter a playlist name.");
            }
            }catch(err){
                openAlert("Error.", "The following error occurred when saving: " + err);
            }*/
            break;
    }
}

function parsePlaylists() {
    document.getElementById("customPlaylists").innerHTML = "";
    for (var i = 0; i < localData.playlists.length; i++) {
        var pName = localData.playlists[i].name;
        document.getElementById("customPlaylists").innerHTML +=
            `<button class="w3-btn w3-round-xlarge w3-ripple btn1 rightclick-activate-playlist" onclick="customPlaylist(${i})" id="customPlaylist${i}">${pName}</button>`;
    }
}

var localData = localStorage.getItem("dataStorage");
if (localData == null) {
    localData = {
        ytinfo: {},
        playlists: [],
        theme: "light",
        looping: "true"
    };
    updateStorage();
} else {
    try {
        localData = JSON.parse(localData);
    } catch {
        localData = {
            ytinfo: {},
            playlists: [],
            theme: "light",
            looping: "true"
        };
        updateStorage();
    }
}
if (localData.looping == null) {
    localData.looping = "true";
}
if (localData.looping == "false") {
    document.getElementById("changeLooping").innerHTML = "Enable looping";
}
var player;
var currentVideo = -1;
var currentVideoId = "";
var scanning = true;
var scanId = 0;
var titles = [];
var titlesOn = true;
var authors = [];
/*
      not working properly, ytvideo overriding this...
      navigator.mediaSession.setActionHandler("nexttrack", function (event) {
        event.preventDefault();
        event.stopPropagation();
        controls(1);
      });
      navigator.mediaSession.setActionHandler("play", function (event) {
        event.preventDefault();
        event.stopPropagation();
        controls(0);
      });
      navigator.mediaSession.setActionHandler("pause", function (event) {
        event.preventDefault();
        event.stopPropagation();
        controls(0);
      });
      */
function preset(n) {
    var ta;
    switch (n) {
        case 0:
            ta =
                "ZLN-TYJJ_9Q, -iVU0TWlwv0, ciQvJsGyHrA, rrGiwJH19sE, 6846K3h2xmc, YIb4NC5ikYo, YNLNoID_Smk, WDCkC3vnJZs, SgR1J4YRhIA, fWpvknKuYrg, 0pkWrvCZDHA, qga1wBBajcA, 1c3uibrPcVs, jVHLp8Szlw4, xMnHsCRNkJk, i73UkuC8gyE, hE2N_qMfoU0, eETqwfsNxiU, 19gZJrXnx3M, CLC_5iqTIsY, iU9nK5rSwjY, xXG30QwhezY, fhS83a5Ky84, E-r7ogDaaEQ, TfiYWaeAcRw";
            break;
        case 1:
            ta =
                "iaZPURV9h_s, N4j2gaKXibg, 19PY5kGS1Sg, -AUwJJHrDFw, b_bMweUkr-k, 2PCC94HC_ag, Is6Xcc7ixNY, h7a7YlcVb3M, Ko9c10m2uX0, I0PrDxe13IQ, H5vmWobxqso, c33C06oWe-4, erjN98Kco2c, Y2vlzwTbhko, uIzTkeZ5WWY, LN1cqABGM5Q, oW5_ifZBIMs";
            break;
    }
    document.getElementById("playlist").value = ta;
}
function customPlaylist(num) {
    var ta = "";
    for (var i = 0; i < localData.playlists[num].ids.length - 1; i++) {
        ta += localData.playlists[num].ids[i] + ", ";
    }
    ta += localData.playlists[num].ids[localData.playlists[num].ids.length - 1];
    document.getElementById("playlist").value = ta;
}
function onYouTubeIframeAPIReady() {
    parsePlaylists();
    document.getElementById("loading").style.display = "none";
    document.getElementById("main").style.display = "block";
    decipherPageLink();
    if (localData.theme == "dark") {
        changeTheme();
    }
}
function shuffleList() {
    var ls = document.getElementById("playlist").value.split(", ");
    ls = shuffle(ls);
    var ret = "";
    for (var i = 0; i < ls.length - 1; i++) {
        ret += ls[i] + ", ";
    }
    ret += ls[ls.length - 1];
    document.getElementById("playlist").value = ret;
}
function go() {
    videoList = document.getElementById("playlist").value.split(", ");
    if (videoList != "") {
        document.getElementById("settings").style.display = "none";
        document.getElementById("scanning").style.display = "block";
        makeVideo();
    }
}
function controls(a) {
    switch (a) {
        case 0:
            var state = player.getPlayerState();
            if (state == 1) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
            break;
        case 1:
            makeVideo();
            break;
    }
}
function shuffle(array) {
    var m = array.length,
        t,
        i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}
function playDone(opt) {
    switch (opt) {
        case 0:
            window.location.reload();
            break;
        case 1:
            currentVideo = -1;
            makeVideo();
            document.getElementById("playDone").style.display = "none";
            break;
        case 2:
            localData.looping = "true";
            document.getElementById("changeLooping").innerHTML = "Disable looping";
            updateStorage();
            makeVideo();
            document.getElementById("playDone").style.display = "none";
            break;
    }
}
function makeVideo() {
    blockClose = true;
    try {
        player.destroy();
    } catch {}
    currentVideo++;
    try {
        highlightCurrent();
    } catch {}
    if (currentVideo > videoList.length - 1) {
        if (localData.looping == "true") {
            currentVideo = -1;
            makeVideo();
        } else {
            document.getElementById("playDone").style.display = "block";
        }
    } else {
        currentVideoId = videoList[currentVideo];
        if (localData.ytinfo[currentVideoId] == null || !scanning) {
            player = new YT.Player("player", {
                height: "390",
                width: "640",
                videoId: currentVideoId,
                playerVars: {
                    playsinline: 1
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: onError
                }
            });
        } else {
            titles[scanId] = localData.ytinfo[currentVideoId].title;
            authors[scanId] = localData.ytinfo[currentVideoId].author;
            if (scanId < videoList.length - 1) {
                scanId++;
                var perc = scanId / videoList.length;
                document.getElementById("loadPerc").innerHTML = Math.floor(perc * 100) + "%";
                document.getElementById("loadBar").style.width =
                    Number(
                        window
                            .getComputedStyle(document.getElementById("loadOutside"), null)
                            .getPropertyValue("width")
                            .split("px")[0]
                    ) *
                        perc +
                    "px";
            } else {
                scanning = false;
                currentVideo = -1;
                updateTitles();
                document.getElementById("scanning").style.display = "none";
                document.getElementById("controls").style.display = "block";
            }
            makeVideo();
        }
    }
}
function onError() {
    if (scanning) {
        titles[scanId] = "Video Error";
        authors[scanId] = "Video Error";
        if (scanId < videoList.length) {
            scanId++;
            var perc = scanId / videoList.length;
            document.getElementById("loadPerc").innerHTML = Math.floor(perc * 100) + "%";
            document.getElementById("loadBar").style.width =
                Number(
                    window
                        .getComputedStyle(document.getElementById("loadOutside"), null)
                        .getPropertyValue("width")
                        .split("px")[0]
                ) *
                    perc +
                "px";
        } else {
            scanning = false;
            currentVideo = -1;
            updateTitles();
            document.getElementById("scanning").style.display = "none";
            document.getElementById("controls").style.display = "block";
        }
    }
    makeVideo();
}
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        makeVideo();
    } else if (event.data == YT.PlayerState.PLAYING) {
        if (scanning) {
            titles[scanId] = getVideoInfo(0);
            authors[scanId] = getVideoInfo(1);
            if (scanId < videoList.length - 1) {
                scanId++;
                var perc = scanId / videoList.length;
                document.getElementById("loadPerc").innerHTML = Math.floor(perc * 100) + "%";
                document.getElementById("loadBar").style.width =
                    Number(
                        window
                            .getComputedStyle(document.getElementById("loadOutside"), null)
                            .getPropertyValue("width")
                            .split("px")[0]
                    ) *
                        perc +
                    "px";
            } else {
                scanning = false;
                currentVideo = -1;
                updateTitles();
                document.getElementById("scanning").style.display = "none";
                document.getElementById("controls").style.display = "block";
            }
            makeVideo();
        } else {
            var ti = titles[currentVideo];
            var au = authors[currentVideo];
            document.getElementById("titles" + currentVideo).innerHTML =
                `<div class="w3-bar-item"><span class="w3-large">${ti}</span><br><span>${au}</span></div>`;
        }
    }
}
function updateTitles() {
    for (var j = 0; j < titles.length; j++) {
        var ti = titles[j];
        var au = authors[j];
        document.getElementById("titleDisplay").innerHTML +=
            `<li id="titles${j}" onclick="skipTo(${j})" class="rightclick-activate-song individualTitle w3-bar"><div class="w3-bar-item"><span class="w3-large">${ti}</span><br><span>${au}</span></div></li>`;
    }
}
function stopVideo() {
    player.stopVideo();
}
function getVideoInfo(n) {
    try {
        var d = player.getVideoData();
        localData.ytinfo[currentVideoId] = d;
        updateStorage();
        var ti;
        if (n == 0) {
            return d.title;
        } else {
            return d.author;
        }
    } catch (err) {
        return "Video is Unavailable";
    }
}
function onPlayerReady(event) {
    event.target.playVideo();
}
function skipTo(n) {
    currentVideo = n - 1;
    makeVideo();
}
function highlightCurrent() {
    var elements = document.getElementsByClassName("individualTitle");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.color = "var(--accent-2)";
    }
    var ele = document.getElementById("titles" + currentVideo);
    ele.style.color = "var(--highlight-color)";
    ele.scrollIntoView();
}
