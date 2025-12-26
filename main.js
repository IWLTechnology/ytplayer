function updateStorage() {
    localStorage.setItem("dataStorage", JSON.stringify(localData));
}

var localData = localStorage.getItem("dataStorage");
if (localData == null) {
    localData = {
        ytinfo: {},
        playlists: {},
        theme: "light"
    };
    updateStorage();
} else {
    try {
        localData = JSON.parse(localData);
    } catch {
        localData = {
            ytinfo: {},
            playlists: {},
            theme: "light"
        };
        updateStorage();
    }
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
function onYouTubeIframeAPIReady() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("main").style.display = "block";
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
function makeVideo() {
    try {
        player.destroy();
    } catch {}
    currentVideo++;
    try {
        highlightCurrent();
    } catch {}
    if (currentVideo > videoList.length - 1) {
        currentVideo = -1;
        makeVideo();
    } else {
        currentVideoId = videoList[currentVideo];
    }
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
    } else if (event.data == YT.PlayerState.PAUSED) {
    }
}
function updateTitles() {
    for (var j = 0; j < titles.length; j++) {
        var ti = titles[j];
        var au = authors[j];
        document.getElementById("titleDisplay").innerHTML +=
            `<li id="titles${j}" onclick="skipTo(${j})" class="individualTitle w3-bar"><div class="w3-bar-item"><span class="w3-large">${ti}</span><br><span>${au}</span></div></li>`;
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
