let messageHistory = [];
let n = 0;

let joefetchFirst = document.createElement("li");
executeCommand('joefetch',joefetchFirst);
messageHistory.push("joefetch");
document.getElementById("history").appendChild(joefetchFirst);

const lastFmDiv = document.getElementById('lastfmplayer');

try {
    const API_KEY = 'a819ab108f2696ef5e373bd07946785d';
    const USERNAME = 'kieroid';
    const lastFmResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`);
    const lastFmJson = await lastFmResponse.json();
    if(lastFmJson.recenttracks.track[0]['@attr'].nowplaying == 'true') {
        const currentSongTitle = lastFmJson.recenttracks.track[0].name;
        const currentArtistTitle = lastFmJson.recenttracks.track[0].artist['#text'];
        let currentLastFm = (currentArtistTitle + " - " + currentSongTitle);
        console.log(currentLastFm);
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
        document.getElementById("history").appendChild(node);

        //remove start text
        if (n === 0) {
            document.getElementById("inputMessage").style.visibility = "hidden";
            n = 1;
        }
    }
});
