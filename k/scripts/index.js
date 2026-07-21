let messageHistory = loadHistory();
let q = 0;

let totalHistory = document.getElementById('history');
let joefetchFirst = document.createElement("li");
executeCommand('joefetch',joefetchFirst);

totalHistory.appendChild(joefetchFirst);


function copyText(btn, text) {
	const original = btn.innerText;

	navigator.clipboard.writeText(text)
	.then(() => {
		btn.innerText = 'COPIED';

		setTimeout(() => {

			btn.innerText = original;
		}, 3000);
	})
	.catch(console.error);
}
window.copyText = copyText;

// command history persists across reloads so the up/down arrows still recall it,
// but we never re-print it on load -- only joefetch greets you.
function loadHistory() {
	try {
		const saved = localStorage.getItem('shellfish.history');
		const arr = saved ? JSON.parse(saved) : null;
		if (Array.isArray(arr)) return arr;
	} catch (e) { /* ignore */ }
	return [];
}

function saveHistory() {
	try {
		localStorage.setItem('shellfish.history', JSON.stringify(messageHistory));
	} catch (e) { /* ignore */ }
}

document.addEventListener("keydown", function(e) {
	const input = document.getElementById("commandinput");
	if (e.key === 'Enter') {
		//input
		let node = document.createElement("li");
		let inputText = input.value;
		input.value = "";

		totalHistory.appendChild(node);
		executeCommand(inputText,node);

		//appending commands
		if (inputText.trim() !== "" && inputText !== messageHistory[messageHistory.length - 1]) {
			messageHistory.push(inputText);
			saveHistory();
		}
		let greetblock = document.getElementById('greetblock');

		while (greetblock.offsetHeight > window.innerHeight && totalHistory.childElementCount > 1) {
			totalHistory.removeChild(totalHistory.firstElementChild);
		}

		document.getElementById("inputMessage").style.visibility = "hidden";

		q = 0;
	}

	if (e.key === 'ArrowUp') {
		e.preventDefault();
		if(q < messageHistory.length) {
			input.value = messageHistory[messageHistory.length - q - 1];
			q = q + 1;
		}
		input.setSelectionRange(input.value.length, input.value.length);
	}
	if (e.key === 'ArrowDown') {
		e.preventDefault();
		if(q >= 1) {
			input.value = messageHistory[messageHistory.length - q + 1];
			q = q-1;
			if(q == 0) { input.value = ""; }
		} else {
			input.value = "";
		}
		input.setSelectionRange(input.value.length, input.value.length);
	}
	if (e.key === 'Tab') {
		e.preventDefault();
		const result = completeInput(input.value);
		if (result) {
			input.value = result.text;
			if (result.options) {
				const optNode = document.createElement('li');
				optNode.appendChild(document.createTextNode(result.options.join('  ')));
				totalHistory.appendChild(optNode);
			}
			input.setSelectionRange(input.value.length, input.value.length);
		}
	}
});
