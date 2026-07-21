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

function echo(args) {
	return html(escapeHtml(args.join(' ')));
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

function clear() {
	let history = document.getElementById('history')
	while (history.hasChildNodes()) {
		history.removeChild(history.firstChild)
	}
	return html("")
}

function mkdir(args) {
	if (args.length === 0) {
		return html('mkdir: missing operand');
	}
	const errors = [];
	let changed = false;
	for (const target of args) {
		const p = resolveParent(target);
		if (p === null) {
			errors.push(`mkdir: cannot create directory '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		if (Object.prototype.hasOwnProperty.call(p.parent, p.name)) {
			errors.push(`mkdir: cannot create directory '${escapeHtml(target)}': File exists`);
			continue;
		}
		p.parent[p.name] = {};
		changed = true;
	}
	if (changed) saveFilesystem();
	return html(errors.join('<br>'));
}

function touch(args) {
	if (args.length === 0) {
		return html('touch: missing file operand');
	}
	const errors = [];
	let changed = false;
	for (const target of args) {
		const p = resolveParent(target);
		if (p === null) {
			errors.push(`touch: cannot touch '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		// existing entry -> no-op (we have no mtime to bump).
		if (Object.prototype.hasOwnProperty.call(p.parent, p.name)) {
			continue;
		}
		p.parent[p.name] = html('');
		changed = true;
	}
	if (changed) saveFilesystem();
	return html(errors.join('<br>'));
}

function rm(args) {
	let recursive = false;
	const targets = [];
	for (const a of args) {
		// flags: -r/-R recurse into directories, -f is tolerated and ignored.
		if (a.startsWith('-') && a.length > 1) {
			if (/[rR]/.test(a)) recursive = true;
		} else {
			targets.push(a);
		}
	}
	if (targets.length === 0) {
		return html('rm: missing operand');
	}
	const errors = [];
	let changed = false;
	for (const target of targets) {
		const resolved = resolvePath(target);
		if (resolved === null) {
			errors.push(`rm: cannot remove '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		if (isDirectory(resolved.node) && !recursive) {
			errors.push(`rm: cannot remove '${escapeHtml(target)}': Is a directory`);
			continue;
		}
		const p = resolveParent(target);
		if (p === null) {
			errors.push(`rm: cannot remove '${escapeHtml(target)}': Invalid argument`);
			continue;
		}
		delete p.parent[p.name];
		changed = true;
	}
	if (changed) {
		normalizeCwd();
		saveFilesystem();
	}
	return html(errors.join('<br>'));
}

function rmdir(args) {
	if (args.length === 0) {
		return html('rmdir: missing operand');
	}
	const errors = [];
	let changed = false;
	for (const target of args) {
		const resolved = resolvePath(target);
		if (resolved === null) {
			errors.push(`rmdir: failed to remove '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		if (!isDirectory(resolved.node)) {
			errors.push(`rmdir: failed to remove '${escapeHtml(target)}': Not a directory`);
			continue;
		}
		if (Object.keys(resolved.node).length > 0) {
			errors.push(`rmdir: failed to remove '${escapeHtml(target)}': Directory not empty`);
			continue;
		}
		const p = resolveParent(target);
		if (p === null) {
			errors.push(`rmdir: failed to remove '${escapeHtml(target)}': Invalid argument`);
			continue;
		}
		delete p.parent[p.name];
		changed = true;
	}
	if (changed) {
		normalizeCwd();
		saveFilesystem();
	}
	return html(errors.join('<br>'));
}

// shared core for mv/cp. moves (remove=true) or copies (remove=false) src to
// dest, returning an error string (already verb-prefixed) or null on success.
function transferEntry(verb, src, dest, destIsDir, remove) {
	const srcResolved = resolvePath(src);
	if (srcResolved === null) {
		return `${verb}: cannot stat '${escapeHtml(src)}': No such file or directory`;
	}
	const action = remove ? 'move' : 'copy';
	const finalSegs = destIsDir ? pathSegments(dest).concat(basename(src)) : pathSegments(dest);
	const name = finalSegs[finalSegs.length - 1];
	if (name === undefined || name === '') {
		return `${verb}: cannot ${action} '${escapeHtml(src)}' to '${escapeHtml(dest)}': Invalid argument`;
	}
	const parentSegs = finalSegs.slice(0, -1);
	const parentResolved = resolvePath(parentSegs.length ? '/' + parentSegs.join('/') : '/');
	if (parentResolved === null || !isDirectory(parentResolved.node)) {
		return `${verb}: cannot ${action} '${escapeHtml(src)}' to '${escapeHtml(dest)}': No such file or directory`;
	}
	if (segEqual(srcResolved.segments, finalSegs)) {
		return `${verb}: '${escapeHtml(src)}' and '${escapeHtml(dest)}' are the same file`;
	}
	if (isDirectory(srcResolved.node) && segPrefix(srcResolved.segments, finalSegs)) {
		return `${verb}: cannot ${action} '${escapeHtml(src)}' to a subdirectory of itself, '${escapeHtml(dest)}'`;
	}
	parentResolved.node[name] = remove ? srcResolved.node : cloneFsNode(srcResolved.node);
	if (remove) {
		const srcParent = resolveParent(src);
		if (srcParent) delete srcParent.parent[srcParent.name];
	}
	return null;
}

function mv(args) {
	if (args.length === 0) {
		return html('mv: missing file operand');
	}
	if (args.length === 1) {
		return html(`mv: missing destination file operand after '${escapeHtml(args[0])}'`);
	}
	const dest = args[args.length - 1];
	const sources = args.slice(0, -1);
	const destResolved = resolvePath(dest);
	const destIsDir = destResolved !== null && isDirectory(destResolved.node);
	if (sources.length > 1 && !destIsDir) {
		return html(`mv: target '${escapeHtml(dest)}' is not a directory`);
	}
	const errors = [];
	let changed = false;
	for (const src of sources) {
		const err = transferEntry('mv', src, dest, destIsDir, true);
		if (err) errors.push(err);
		else changed = true;
	}
	if (changed) {
		normalizeCwd();
		saveFilesystem();
	}
	return html(errors.join('<br>'));
}

function cp(args) {
	if (args.length === 0) {
		return html('cp: missing file operand');
	}
	if (args.length === 1) {
		return html(`cp: missing destination file operand after '${escapeHtml(args[0])}'`);
	}
	const dest = args[args.length - 1];
	const sources = args.slice(0, -1);
	const destResolved = resolvePath(dest);
	const destIsDir = destResolved !== null && isDirectory(destResolved.node);
	if (sources.length > 1 && !destIsDir) {
		return html(`cp: target '${escapeHtml(dest)}' is not a directory`);
	}
	const errors = [];
	let changed = false;
	for (const src of sources) {
		const err = transferEntry('cp', src, dest, destIsDir, false);
		if (err) errors.push(err);
		else changed = true;
	}
	if (changed) {
		saveFilesystem();
	}
	return html(errors.join('<br>'));
}

function html(t) {
	const div = document.createElement('div');
	div.innerHTML = t;
	return div;
}

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function promptHtml() {
	return '<span class="prompt-user">kiera</span>@<span class="prompt-host">shellfish.racing</span> ' + escapeHtml(currentPath()) + ' $ ';
}

// redirect a command's output node into a file. `>` overwrites, `>>` appends.
// returns an error string or null. programs (in /bin) can't be clobbered.
function writeToFile(target, node, append) {
	const p = resolveParent(target);
	if (p === null) {
		return `CRAsh: ${escapeHtml(target)}: No such file or directory`;
	}
	const existing = p.parent[p.name];
	if (isDirectory(existing)) {
		return `CRAsh: ${escapeHtml(target)}: Is a directory`;
	}
	if (typeof existing === 'function') {
		return `CRAsh: ${escapeHtml(target)}: cannot overwrite program`;
	}
	const incoming = node ? node.innerHTML : '';
	let content = incoming;
	if (append && existing) {
		const existingInner = existing.innerHTML;
		content = existingInner && incoming ? existingInner + '<br>' + incoming : existingInner + incoming;
	}
	p.parent[p.name] = html(content);
	saveFilesystem();
	return null;
}

function executeCommand(inputText, node) {
	const promptEl = document.createElement('span');
	promptEl.innerHTML = promptHtml();
	node.appendChild(promptEl)
	node.appendChild(document.createTextNode(inputText))
	node.appendChild(document.createElement("br"))

	// split off a trailing `>`/`>>` redirection, tolerating attached forms (a>b).
	const parts = inputText.replace(/>>?/g, m => ' ' + m + ' ').trim().split(/\s+/);
	let redirect = null;
	const opIdx = parts.findIndex(p => p === '>' || p === '>>');
	if (opIdx !== -1) {
		redirect = { append: parts[opIdx] === '>>', target: parts[opIdx + 1] };
		parts.splice(opIdx);
	}
	const command = parts[0] === undefined ? "" : parts[0];
	const args = parts.slice(1);

	if (redirect && (redirect.target === undefined || redirect.target === '')) {
		node.appendChild(document.createTextNode('CRAsh: syntax error near unexpected token `newline`'))
	} else if (command === "" && redirect) {
		// bare redirection like `> a` just truncates/creates an empty file.
		const err = writeToFile(redirect.target, null, redirect.append);
		if (err) node.appendChild(document.createTextNode(err))
	} else if (command !== "") {
		const program = resolveCommand(command);
		if (typeof program !== 'function') {
			node.appendChild(document.createTextNode(`CRAsh: ${command}: command not found`))
		} else {
			try {
				const result = program(args);
				if (redirect) {
					const err = writeToFile(redirect.target, result, redirect.append);
					if (err) node.appendChild(document.createTextNode(err))
				} else {
					node.appendChild(result)
				}
			} catch (err) {
				node.appendChild(document.createTextNode(`CRAsh: ${command}: ${err}`))
			}
		}
	}

	const label = document.getElementById('prompt');
	if (label) label.innerHTML = promptHtml();
}
