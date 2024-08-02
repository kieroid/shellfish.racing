let cachedHex = null;

async function fetchFile(url) {
    if (!cachedHex) {
        const response = await fetch(url);
        const text = await response.text();
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
                let char = String.fromCharCode(parseInt(hexPair, 16));
                if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
                    char = '.';
                }
                textLine.push(char);
            } else {
                hexLine.push('..');
                textLine.push('.');
            }
        }

        hexCount.innerHTML += `${lineCount.toString(16).padStart(3, '0')}<br>`;
        hexContent.innerHTML += `${hexLine.join(' ')}<br>`;
        hexAscii.innerHTML += `${textLine.join('')}<br>`;
        lineCount++;
    }

    // Ensure any leftover content also has proper line breaks
    if (hex.length % 32 !== 0) {
        hexCount.innerHTML += '<br>';
        hexContent.innerHTML += '<br>';
        hexAscii.innerHTML += '<br>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const fileUrl = "https://raw.githubusercontent.com/kieroid/shellfish.racing/main/index.html"; // Adjust URL accordingly

    fetchFile(fileUrl).then(hex => {
        renderHexViewer(hex);
    });
});