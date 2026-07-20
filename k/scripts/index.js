let messageHistory = [];
let q = 0;

let totalHistory = document.getElementById('history');
let joefetchFirst = document.createElement("li");
executeCommand('joefetch',joefetchFirst);

messageHistory.push("joefetch");
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

		while (historyHeight >= 0.8 * windowLength) {
			totalHistory.removeChild(totalHistory.firstElementChild);
			historyHeight = totalHistory.offsetHeight;
		}

		document.getElementById("inputMessage").style.visibility = "hidden";

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
