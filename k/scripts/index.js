let messageHistory = [];
let n = 0;
let q = 0;

let totalHistory = document.getElementById('history');
let joefetchFirst = document.createElement("li");
const lastFmDiv = document.getElementById('lastfmplayer');
executeCommand('joefetch',joefetchFirst);

messageHistory.push("joefetch");
totalHistory.appendChild(joefetchFirst);

try {
    const API_KEY = 'a819ab108f2696ef5e373bd07946785d';
    const USERNAME = 'kieroid';
    const lastFmResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`);
    const lastFmJson = await lastFmResponse.json();
    if(lastFmJson.recenttracks.track[0]['@attr'].nowplaying == 'true') {
        const currentSongTitle = lastFmJson.recenttracks.track[0].name;
        const currentArtistTitle = lastFmJson.recenttracks.track[0].artist['#text'];
        let currentLastFm = (currentArtistTitle + " - " + currentSongTitle);
	lastFmDiv.innerHTML = `${currentLastFm}`;
    }
}
catch {
    lastFmDiv.innerHTML = 'N/A';
}

document.addEventListener("keydown", function(e) {
    if (e.key === 'Enter') {
        //input
        let input = document.getElementById("commandinput");
        let node = document.createElement("li");
        let inputText = input.value;
        input.value = "";

        executeCommand(inputText,node);

        //appending commands
        messageHistory.push(inputText)
        totalHistory.appendChild(node);
        
        let historyHeight = totalHistory.offsetHeight;
        let windowLength = window.innerHeight;

	if(historyHeight >= 0.8 * windowLength) { totalHistory.removeChild(totalHistory.firstElementChild); }
        
        if (n === 0) {
            document.getElementById("inputMessage").style.visibility = "hidden";
            n = 0;
        }
	q = 0;
    }
    if (e.key === 'ArrowUp') {
        let input = document.getElementById('commandinput');
	if(q < messageHistory.length) {
	    input.value = messageHistory[messageHistory.length - q - 1];
	    q = q + 1;
        }
    }
    if (e.key === 'ArrowDown') {
        let input = document.getElementById('commandinput');
	if(q >= 1) {
	    input.value = messageHistory[messageHistory.length - q + 1];
	    q = q-1;
	    if(q == 0) { input.value = ""; }
	} else {
	    input.value = "";
	}
    }

});
