function ls(args) {
	const target = args[0] === undefined ? '.' : args[0];
	const resolved = resolvePath(target);
	if (resolved === null) {
		return html(`ls: cannot access '${escapeHtml(target)}': No such file or directory`);
	}
	if (!isDirectory(resolved.node)) {
		return html(escapeHtml(target));
	}
	const names = Object.keys(resolved.node).map(name => {
		const child = resolved.node[name];
		if (isDirectory(child)) return `<span class="fs-dir">${name}/</span>`;
		if (typeof child === 'function') return `<span class="fs-exec">${name}</span>`;
		return name;
	});
	return html(names.join('  '));
}

function cd(args) {
	const target = args[0];
	if (target === undefined || target === '') {
		cwd = [];
		return html('');
	}
	const resolved = resolvePath(target);
	if (resolved === null) {
		return html(`cd: ${escapeHtml(target)}: no such file or directory`);
	}
	if (!isDirectory(resolved.node)) {
		return html(`cd: ${escapeHtml(target)}: not a directory`);
	}
	cwd = resolved.segments;
	return html('');
}

function cat(args) {
	if (args[0] === undefined || args[0] === '') {
		return html('cat: missing file operand');
	}
	const resolved = resolvePath(args[0]);
	if (resolved === null) {
		return html(`cat: ${escapeHtml(args[0])}: No such file or directory`);
	}
	if (isDirectory(resolved.node)) {
		return html(`cat: ${escapeHtml(args[0])}: Is a directory`);
	}
	// a program is a function -> print its source. a file is a node -> print it.
	if (typeof resolved.node === 'function') {
		return html('<pre style="margin: 0">' + escapeHtml(resolved.node.toString()) + '</pre>');
	}
	return resolved.node.cloneNode(true);
}

function pwd() {
	return html(currentPath());
}

function joefetch() {
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
	return html(Object.keys(resolvePath('/bin').node).join(", ") +"<br>use --help to get more help on a specific command")
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

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shellPrompt() {
	return 'kiera@shellfish.racing ' + currentPath() + ' $ ';
}

function executeCommand(inputText, node) {
	node.appendChild(document.createTextNode(shellPrompt() + inputText))
	node.appendChild(document.createElement("br"))

	const parts = inputText.trim().split(/\s+/);
	const command = parts[0];
	const args = parts.slice(1);
	if (command !== "") {
		const program = resolveCommand(command);
		if (typeof program !== 'function') {
			node.appendChild(document.createTextNode(`CRAsh: ${command}: command not found`))
		} else {
			try {
				node.appendChild(program(args))
			} catch (err) {
				node.appendChild(document.createTextNode(`CRAsh: ${command}: ${err}`))
			}
		}
	}

	const label = document.getElementById('prompt');
	if (label) label.textContent = shellPrompt();
}
