function joefetch(args) {
	if (args.includes("--help")) {
		return html(`Usage: joefetch [OPTION]...<br>
		Joefetch is a CLI system information tool written in CRAsh. Joefetch<br>
		displays information about your system next to an image, your OS logo,<br>
		or any ASCII file of your choice.<br><br>
		&nbsp;&nbsp;&nbsp;&nbsp;--fart&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;shittin and fartin`)
	}
	if (args.includes("--fart")) {
		return html(`
		<div class="joefetch">
			<img class="joefetch-img u-logo" src="/k/images/groggy.png" width="128" height="128" alt="">
			<div class="joefetch-text">
				<b><a href="https://www.youtube.com/watch?v=RZALXYsc7C0">kiera</a></b>@<b>shellfish.racing</b><br>
				------------------------<br>
				fart fart fart, poop poop. fart poop.<br>
				poop is funny<br>
				poop and fart poop<br>
				farting is funny (farts are funny) fart fart<br><br>
			</div>
		</div>`)
	}
	return html(`
	<div class="joefetch">
		<img class="joefetch-img u-logo" src="/k/images/a.jpg" width="128" height="128" alt="">
		<div class="joefetch-text">
			<b><a href="https://www.youtube.com/watch?v=RZALXYsc7C0">kiera</a></b>@<b>shellfish.racing</b><br>
			------------------------<br>
			22 y.o. <a href="https://www.coreboot.org/">coreboot</a> and linux enthusiast<br>
			inventor of leaded fuel, teflon, and CFCs.<br>
			i am a nerd, loser, and a mischevious gremlin.<br>
			<br>
			<b>pronouns: </b>she/her
			<br><br>
			<b>links: </b><a href="https://git.shellfish.racing/kiki">forgejo</a> <a href="https://www.last.fm/user/kieroid">last.fm</a> <a href="https://tech.lgbt/@ki">mastodon</a><br>
			<b>contact: </b> <button onclick="copyText(this, '@lvto')">discord</button> <button onclick="copyText(this, '@kier.99')">signal</button> <a href="https://matrix.to/#/@kiera:shellfish.racing">matrix</a><br>
		</div>
	</div>`);
}

function help(args) {
	if (args[0] === '--help') {
		return html('HEEEELP ME HEEEELP HEEELP HEEELP I AM STUCK HEEEEEEEELP HELP ME HEEEELP')
	}
	return html(Object.keys(commands).join(", ") +"<br>use --help to get more help on a specific command")
}

function clear() {
	let history = document.getElementById('history')
	while (history.hasChildNodes()) {
		history.removeChild(history.firstChild)
	}
	return html("")
}

function exit(args) {
	return html("")
}

function html(t) {
	const div = document.createElement('div');
	div.innerHTML = t;
	return div;
}

function executeCommand(inputText,node) {
	node.appendChild(document.createTextNode(`kiera@shellfish.racing ~ $ ${inputText}`))
	node.appendChild(document.createElement("br"))

	const command = inputText.trim().split(' ')[0];
	let args = inputText.trim().split(' ').slice(1);
	if (command !== "") {
		try {
			node.appendChild(commands[command](args))
		} catch(err) {
			node.appendChild(document.createTextNode(`CRAsh: ${command}: command not found`))
		}
	}
}
const commands = {
	"help": help,
	"clear": clear,
	"joefetch": joefetch,
	"exit": exit
};
