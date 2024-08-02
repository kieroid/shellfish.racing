let cachedHex = null;

async function fetchFileAndConvertToHex(url, HexLocationValues) {
    if (!cachedHex) {
        const response = await fetch(url);
        const text = await response.text();
        cachedHex = Array.from(text).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join('');
    }
    const hexPair = cachedHex.slice(HexLocationValues * 2, HexLocationValues * 2 + 2);
    console.log(hexPair);
}

document.addEventListener("DOMContentLoaded", () => {
    const fileUrl = "https://raw.githubusercontent.com/kieroid/shellfish.racing/main/index.html"; // Adjust URL accordingly
    const HexLocationValues = 1; // Adjust as needed
    fetchFileAndConvertToHex(fileUrl, HexLocationValues);
});