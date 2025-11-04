var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var currentVideo = -1;
var endVideo;
var scanning = false;
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
    switch (n) {
        case 0:
            var ta =
                "ZLN-TYJJ_9Q, -iVU0TWlwv0, ciQvJsGyHrA, rrGiwJH19sE, 6846K3h2xmc, YIb4NC5ikYo, YNLNoID_Smk, WDCkC3vnJZs, SgR1J4YRhIA, fWpvknKuYrg, 0pkWrvCZDHA, qga1wBBajcA, 1c3uibrPcVs, jVHLp8Szlw4, xMnHsCRNkJk, i73UkuC8gyE, hE2N_qMfoU0, eETqwfsNxiU, 19gZJrXnx3M, CLC_5iqTIsY, iU9nK5rSwjY, xXG30QwhezY, fhS83a5Ky84, E-r7ogDaaEQ";
            var fv = "TfiYWaeAcRw";
            break;
        case 1:
            var ta =
                "2PcE8BlkTjc, Qf-aUylWtI8, 05Boiab4c4U, OMbfT3Wppjo, 1fue7OUT-Xk, WIit0NbgRpQ, IN2tJQ2r0L8, IqfV0zeEvT8, 9R8x5YlbQ0Q, dWiRhEBRZZM, 8rY6JhJmcoU, MPXJsQMdmoY, sAg7rn7fH3Q, QurQEiOAQjA, y8nVfW_7rsw, erFT6nmvMm0, ttTFmr6XdPc, 1_vKqgcFF4w, XFRjr_x-yxU, xrpaQv67wic, I-nU1yLlza4, OcOS9j-NXRQ, C8sOFRdUnRw, jjaKKAsQc34, _3UsWiYBFCo, j6dhmhTgc84, RdMC056l03s, vd4lgL4SpMQ, tQCvky1Qo_g, LMuFA_XBtWk, RVXzZ760XA8, E2U5GoX4dew, YTn2sViERsg, _NWrPp8QxZI, tof8_p0F3kg, GjnsAjsQ2cw, Kc3aDajU9JM, DwKSFrBEF6s, wCw-W-2Rs0k, zS7jlWG5Dlw, JUTYnW48C9E, Uc_HxKMKB_E, pYkcqnzWo5w, ix6e9h40qMg, o-xRxXYpavU";
            var fv = "NNiTxUEnmKI";
            break;
    }
    document.getElementById("playlist").value = ta;
    document.getElementById("endVideo").value = fv;
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
    endVideo = document.getElementById("endVideo").value;
    if (videoList == "" || endVideo == "") {
        alert("Please enter values for all the fields.");
    } else {
        document.getElementById("settings").style.display = "none";
        if (document.getElementById("vidTitle").checked == true) {
            scanning = true;
            document.getElementById("scanning").style.display = "block";
        } else {
            titlesOn = false;
            for (var i = 0; i < videoList.length; i++) {
                titles[i] = "Video " + (i + 1);
                authors[i] = "Unknown";
            }
            var i = videoList.length;
            titles[i] = "Video " + (i + 1);
            authors[i] = "Unknown";
            updateTitles();
            document.getElementById("controls").style.display = "block";
        }
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
    if (currentVideo == videoList.length) {
        player = new YT.Player("player", {
            height: "390",
            width: "640",
            videoId: endVideo,
            playerVars: {
                playsinline: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onError
            }
        });
    } else if (currentVideo > videoList.length) {
        currentVideo = -1;
        makeVideo();
    } else {
        player = new YT.Player("player", {
            height: "390",
            width: "640",
            videoId: videoList[currentVideo],
            playerVars: {
                playsinline: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onError
            }
        });
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
            makeVideo();
        } else {
            titles[currentVideo] = getVideoInfo(0);
            authors[currentVideo] = getVideoInfo(1);
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
