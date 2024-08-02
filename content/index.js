let cachedHex = null;

async function fetchFile(url) {
    if (!cachedHex) {
        const response = await fetch(url);
        let text = await response.text();
        text = text.replace(/[<>&\t]/g, ''); // Remove "<", ">", "&", and tab characters
        cachedHex = Array.from(text).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    }
    return cachedHex;
}

function getHexPair(hex, HexLocationValues) {
    return hex.slice(HexLocationValues * 2, HexLocationValues * 2 + 2);
}

function renderHexViewer(hex) {
    const hexCount = document.getElementById('hex-dump-count');
    const hexContent = document.getElementById('hex-dump-content');
    const hexAscii = document.getElementById('hex-dump-ascii');

    hexCount.innerHTML = '';
    hexContent.innerHTML = '';
    hexAscii.innerHTML = '';

    let lineCount = 0;
    while (lineCount < Math.ceil(hex.length / 32)) {
        const hexLine = [];
        const textLine = [];
        for (let j = 0; j < 16; j++) {
            const index = lineCount * 16 + j;
            if (index * 2 < hex.length) {
                const hexPair = getHexPair(hex, index);
                hexLine.push(hexPair);
                const charCode = parseInt(hexPair, 16);
                const char = String.fromCharCode(charCode);
                textLine.push(char.match(/[ -~]/) ? char : '.'); // Replace non-printable characters with '.'
            } else {
                hexLine.push('..'); // When the line is ending, missing characters are shown as ".."
                textLine.push('.');
            }
        }
        hexCount.innerHTML += `${lineCount.toString(16).padStart(3, '0')}<br>`;
        hexContent.innerHTML += `${hexLine.join(' ')}<br>`;
        hexAscii.innerHTML += `${textLine.join('').replace(/\s/g, '.')}<br>`;
        lineCount++;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const fileUrl = "https://raw.githubusercontent.com/kieroid/shellfish.racing/main/k/scripts/commands.js"; // Adjust URL accordingly

    fetchFile(fileUrl).then(hex => {
        renderHexViewer(hex);
    });
});