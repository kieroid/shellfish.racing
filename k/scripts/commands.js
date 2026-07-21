function ls(args) {
	const targets = args.length === 0 ? ['.'] : args;
	const errors = [];
	const files = [];       // non-directory operands, listed together on one line
	const dirs = [];        // { target, listing } for directory operands
	for (const target of targets) {
		const resolved = resolvePath(target);
		if (resolved === null) {
			errors.push(`ls: cannot access '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		if (isDirectory(resolved.node)) {
			const listing = Object.keys(resolved.node).map(name => colorName(name, resolved.node[name])).join('  ');
			dirs.push({ target, listing });
		} else {
			files.push(colorName(target, resolved.node));
		}
	}
	// with more than one operand, directories get a "name:" header, like real ls.
	const header = targets.length > 1;
	const blocks = [];
	if (errors.length) blocks.push(errors.join('<br>'));
	if (files.length) blocks.push(files.join('  '));
	for (const d of dirs) {
		blocks.push(header ? `${escapeHtml(d.target)}:<br>${d.listing}` : d.listing);
	}
	return html(blocks.join('<br>'));
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
	if (args.length === 0) {
		return html('cat: missing file operand');
	}
	const out = html('');
	for (const target of args) {
		const resolved = resolvePath(target);
		if (resolved === null) {
			out.appendChild(html(`cat: ${escapeHtml(target)}: No such file or directory`));
			continue;
		}
		if (isDirectory(resolved.node)) {
			out.appendChild(html(`cat: ${escapeHtml(target)}: Is a directory`));
			continue;
		}
		// a program (function) or executable file -> print its source. a plain file
		// is a node -> render a clone.
		if (typeof resolved.node === 'function') {
			out.appendChild(html('<pre style="margin: 0">' + escapeHtml(resolved.node.toString()) + '</pre>'));
		} else if (isExecutableFile(resolved.node)) {
			out.appendChild(html('<pre style="margin: 0">' + escapeHtml(resolved.node.textContent) + '</pre>'));
		} else {
			out.appendChild(resolved.node.cloneNode(true));
		}
	}
	return out;
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
	document.getElementById('history').replaceChildren();
	return html("");
}

function exit() {
	window.close();
	// browsers only let window.close() shut tabs a script opened; if we got here,
	// it was blocked (a directly-opened tab), so say so instead of doing nothing.
	return html('exit: the browser will not let me close this tab. close it yourself :)');
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

function chmod(args) {
	if (args.length < 2) {
		return html('chmod: missing operand');
	}
	const mode = args[0];
	let executable;
	if (mode === '+x') executable = true;
	else if (mode === '-x') executable = false;
	else return html(`chmod: invalid mode: '${escapeHtml(mode)}'`);
	const errors = [];
	let changed = false;
	for (const target of args.slice(1)) {
		const resolved = resolvePath(target);
		if (resolved === null) {
			errors.push(`chmod: cannot access '${escapeHtml(target)}': No such file or directory`);
			continue;
		}
		if (isDirectory(resolved.node)) {
			errors.push(`chmod: '${escapeHtml(target)}': is a directory`);
			continue;
		}
		if (typeof resolved.node === 'function') {
			errors.push(`chmod: '${escapeHtml(target)}': is a built-in program`);
			continue;
		}
		resolved.node.executable = executable;
		changed = true;
	}
	if (changed) saveFilesystem();
	return html(errors.join('<br>'));
}

// color a filesystem entry the way ls/tree do: dirs green, runnables blue.
function colorName(name, child) {
	if (isDirectory(child)) return `<span class="fs-dir">${escapeHtml(name)}/</span>`;
	if (isRunnable(child)) return `<span class="fs-exec">${escapeHtml(name)}</span>`;
	return escapeHtml(name);
}

function tree(args) {
	const target = args[0] === undefined ? '.' : args[0];
	const resolved = resolvePath(target);
	if (resolved === null) {
		return html(`tree: ${escapeHtml(target)}: No such file or directory`);
	}
	if (!isDirectory(resolved.node)) {
		return html(escapeHtml(target));
	}
	const lines = [target === '.' ? '.' : escapeHtml(target)];
	buildTree(resolved.node, '', lines);
	return html('<pre style="margin: 0">' + lines.join('\n') + '</pre>');
}

// recursively append a directory's entries to `lines` with tree-drawing prefixes.
function buildTree(dir, prefix, lines) {
	const keys = Object.keys(dir);
	keys.forEach((name, i) => {
		const child = dir[name];
		const last = i === keys.length - 1;
		lines.push(prefix + (last ? '└── ' : '├── ') + colorName(name, child));
		if (isDirectory(child)) {
			buildTree(child, prefix + (last ? '    ' : '│   '), lines);
		}
	});
}

// --- text plumbing for pipes -----------------------------------------------

// extract a node's content as plain text for piping: <br> becomes a newline and
// remaining markup is stripped, so line-oriented filters see real lines.
function nodeToText(node) {
	if (!node) return '';
	const markup = node.innerHTML.replace(/<br\s*\/?>/gi, '\n');
	const tmp = document.createElement('div');
	tmp.innerHTML = markup;
	return tmp.textContent;
}

// wrap plain text (newline-separated) back into a rendered node: lines become
// <br>-separated and the text is escaped so file content can't inject markup.
function textNode(text) {
	return html(escapeHtml(text).replace(/\n/g, '<br>'));
}

// a filter's input: the named file's text if given, else piped stdin. returns
// { text } or { error } (an unescaped message for textNode to render).
function readInput(name, file, stdin) {
	if (file !== undefined) {
		const resolved = resolvePath(file);
		if (resolved === null) return { error: `${name}: ${file}: No such file or directory` };
		if (isDirectory(resolved.node)) return { error: `${name}: ${file}: Is a directory` };
		// a built-in program has no content of its own; read its source, like cat.
		if (typeof resolved.node === 'function') return { text: resolved.node.toString() };
		return { text: nodeToText(resolved.node) };
	}
	return { text: stdin === null || stdin === undefined ? '' : stdin };
}

function grep(args, stdin) {
	let ignoreCase = false;
	const rest = [];
	for (const a of args) {
		if (a.startsWith('-') && a.length > 1) {
			if (/i/.test(a)) ignoreCase = true;
		} else rest.push(a);
	}
	if (rest[0] === undefined) return html('grep: missing pattern');
	const input = readInput('grep', rest[1], stdin);
	if (input.error) return textNode(input.error);
	let re;
	try {
		re = new RegExp(rest[0], ignoreCase ? 'i' : '');
	} catch (e) {
		return textNode(`grep: invalid pattern: ${rest[0]}`);
	}
	const matched = input.text.split('\n').filter(line => re.test(line));
	return textNode(matched.join('\n'));
}

// shared -n / -<num> count parsing for head/tail. returns { count, file }.
function countArgs(args) {
	let count = 10;
	const files = [];
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '-n') { count = parseInt(args[++i], 10); }
		else if (a.startsWith('-n')) { count = parseInt(a.slice(2), 10); }
		else if (/^-\d+$/.test(a)) { count = parseInt(a.slice(1), 10); }
		else files.push(a);
	}
	if (!Number.isFinite(count) || count < 0) count = 10;
	return { count, file: files[0] };
}

function head(args, stdin) {
	const { count, file } = countArgs(args);
	const input = readInput('head', file, stdin);
	if (input.error) return textNode(input.error);
	return textNode(input.text.split('\n').slice(0, count).join('\n'));
}

function tail(args, stdin) {
	const { count, file } = countArgs(args);
	const input = readInput('tail', file, stdin);
	if (input.error) return textNode(input.error);
	const lines = input.text.split('\n');
	return textNode(count === 0 ? '' : lines.slice(-count).join('\n'));
}

function wc(args, stdin) {
	let showLines = false, showWords = false, showChars = false;
	const rest = [];
	for (const a of args) {
		if (a.startsWith('-') && a.length > 1) {
			if (/l/.test(a)) showLines = true;
			if (/w/.test(a)) showWords = true;
			if (/c/.test(a)) showChars = true;
		} else rest.push(a);
	}
	if (!showLines && !showWords && !showChars) showLines = showWords = showChars = true;
	const input = readInput('wc', rest[0], stdin);
	if (input.error) return textNode(input.error);
	const text = input.text;
	const out = [];
	if (showLines) out.push(text === '' ? 0 : text.split('\n').length);
	if (showWords) out.push(text.split(/\s+/).filter(Boolean).length);
	if (showChars) out.push(text.length);
	if (rest[0] !== undefined) out.push(rest[0]);
	return textNode(out.join(' '));
}

function sort(args, stdin) {
	// -r reverse, -n numeric, -u drop duplicates (like sort -u).
	let reverse = false, numeric = false, unique = false;
	const rest = [];
	for (const a of args) {
		if (a.startsWith('-') && a.length > 1) {
			if (/r/.test(a)) reverse = true;
			if (/n/.test(a)) numeric = true;
			if (/u/.test(a)) unique = true;
		} else rest.push(a);
	}
	const input = readInput('sort', rest[0], stdin);
	if (input.error) return textNode(input.error);
	let lines = input.text === '' ? [] : input.text.split('\n');
	lines.sort(numeric
		? (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0)
		: (a, b) => a < b ? -1 : (a > b ? 1 : 0));
	if (reverse) lines.reverse();
	if (unique) lines = lines.filter((line, i) => i === 0 || line !== lines[i - 1]);
	return textNode(lines.join('\n'));
}

function uniq(args, stdin) {
	// -c prefix each line with its count, -d show only duplicated lines.
	let count = false, dupsOnly = false;
	const rest = [];
	for (const a of args) {
		if (a.startsWith('-') && a.length > 1) {
			if (/c/.test(a)) count = true;
			if (/d/.test(a)) dupsOnly = true;
		} else rest.push(a);
	}
	const input = readInput('uniq', rest[0], stdin);
	if (input.error) return textNode(input.error);
	const lines = input.text === '' ? [] : input.text.split('\n');
	// uniq only collapses *adjacent* duplicate lines, like the real thing.
	const groups = [];
	for (const line of lines) {
		const last = groups[groups.length - 1];
		if (last && last.line === line) last.n += 1;
		else groups.push({ line, n: 1 });
	}
	const out = groups
		.filter(g => !dupsOnly || g.n > 1)
		.map(g => count ? `${g.n} ${g.line}` : g.line);
	return textNode(out.join('\n'));
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
	const result = html(content);
	// editing an existing executable file keeps its exec bit, like a real chmod.
	if (existing instanceof Node && existing.executable === true) {
		result.executable = true;
	}
	p.parent[p.name] = result;
	saveFilesystem();
	return null;
}

// run a resolved command: a built-in function, or an executable file whose text
// is executed as a JS function body (with access to html(), args, stdin, ...).
function runProgram(program, args, stdin) {
	if (typeof program === 'function') {
		return program(args, stdin);
	}
	const fn = new Function('args', 'stdin', program.textContent);
	const out = fn(args, stdin);
	if (out instanceof Node) return out;
	return html(out === undefined || out === null ? '' : escapeHtml(String(out)));
}

// split a command line into tokens. single/double quotes group text (and are
// stripped); the shell operators ; | > >> become their own tokens, but only when
// unquoted. returns [{ value, op }], where op flags an operator token.
function tokenize(input) {
	const tokens = [];
	let i = 0;
	while (i < input.length) {
		const c = input[i];
		if (c === ' ' || c === '\t') { i += 1; continue; }
		if (c === '>') {
			if (input[i + 1] === '>') { tokens.push({ value: '>>', op: true }); i += 2; }
			else { tokens.push({ value: '>', op: true }); i += 1; }
			continue;
		}
		if (c === '|') { tokens.push({ value: '|', op: true }); i += 1; continue; }
		if (c === ';') { tokens.push({ value: ';', op: true }); i += 1; continue; }
		// a word: accumulate until whitespace or an operator, honoring quotes. we
		// remember whether any part was quoted so globbing skips quoted words.
		let value = '';
		let quoted = false;
		while (i < input.length) {
			const ch = input[i];
			if (ch === ' ' || ch === '\t' || ch === '>' || ch === '|' || ch === ';') break;
			if (ch === '"' || ch === "'") {
				const quote = ch;
				quoted = true;
				i += 1;
				while (i < input.length && input[i] !== quote) { value += input[i]; i += 1; }
				i += 1; // skip the closing quote (an unterminated quote just ends the word)
				continue;
			}
			value += ch;
			i += 1;
		}
		tokens.push({ value, op: false, quoted });
	}
	return tokens;
}

// does this word contain glob metacharacters worth expanding?
function hasGlob(s) {
	return /[*?]/.test(s);
}

// build an anchored RegExp from one path component's glob: * -> any run of chars,
// ? -> any single char, everything else matched literally.
function globToRegExp(glob) {
	let re = '^';
	for (const ch of glob) {
		if (ch === '*') re += '.*';
		else if (ch === '?') re += '.';
		else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	return new RegExp(re + '$');
}

// expand a glob against the filesystem. only the last path component globs; the
// directory prefix is taken literally. returns matching paths sorted, or [] if
// nothing matches (the caller then leaves the pattern literal, like bash).
function expandGlob(pattern) {
	const slash = pattern.lastIndexOf('/');
	const dirPart = slash === -1 ? '' : pattern.slice(0, slash + 1);
	const globPart = slash === -1 ? pattern : pattern.slice(slash + 1);
	const dir = resolvePath(dirPart === '' ? '.' : dirPart);
	if (dir === null || !isDirectory(dir.node)) return [];
	const re = globToRegExp(globPart);
	return Object.keys(dir.node)
		.filter(name => re.test(name))
		.sort()
		.map(name => dirPart + name);
}

function executeCommand(inputText, node) {
	const promptEl = document.createElement('span');
	promptEl.innerHTML = promptHtml();
	node.appendChild(promptEl)
	node.appendChild(document.createTextNode(inputText))
	node.appendChild(document.createElement("br"))

	// split the line into `;`-separated command lines and run each in order.
	const tokens = tokenize(inputText);
	const lines = [[]];
	for (const t of tokens) {
		if (t.op && t.value === ';') lines.push([]);
		else lines[lines.length - 1].push(t);
	}
	for (const lineTokens of lines) {
		runPipeline(lineTokens, node);
	}

	const label = document.getElementById('prompt');
	if (label) label.innerHTML = promptHtml();
}

// run one command line (a token list): split into pipeline stages on `|`, pull a
// trailing redirect off the final stage, expand globs, then execute the stages,
// appending output or errors to `node`.
function runPipeline(tokens, node) {
	const stages = [[]];
	for (const t of tokens) {
		if (t.op && t.value === '|') stages.push([]);
		else stages[stages.length - 1].push(t);
	}

	let redirect = null;
	const lastStage = stages[stages.length - 1];
	const opIdx = lastStage.findIndex(t => t.op && (t.value === '>' || t.value === '>>'));
	if (opIdx !== -1) {
		const targetTok = lastStage[opIdx + 1];
		redirect = { append: lastStage[opIdx].value === '>>', target: targetTok ? targetTok.value : undefined };
		lastStage.splice(opIdx);
	}

	// each stage becomes { command, args }; stray operator tokens are dropped, and
	// unquoted argument words with glob chars are expanded against the filesystem.
	const commands = stages.map(stage => {
		const words = stage.filter(t => !t.op);
		const expanded = [];
		words.forEach((t, i) => {
			if (i > 0 && !t.quoted && hasGlob(t.value)) {
				const matches = expandGlob(t.value);
				if (matches.length > 0) { expanded.push(...matches); return; }
			}
			expanded.push(t.value);
		});
		return { command: expanded[0] === undefined ? "" : expanded[0], args: expanded.slice(1) };
	});
	const multi = commands.length > 1;

	if (redirect && (redirect.target === undefined || redirect.target === '')) {
		node.appendChild(document.createTextNode('CRAsh: syntax error near unexpected token `newline`'))
	} else if (!multi && commands[0].command === "" && redirect) {
		// bare redirection like `> a` just truncates/creates an empty file.
		const err = writeToFile(redirect.target, null, redirect.append);
		if (err) node.appendChild(document.createTextNode(err))
	} else if (commands.some(c => c.command === "")) {
		// an empty stage in a pipeline/redirect is a syntax error; a blank line isn't.
		if (multi || redirect) {
			node.appendChild(document.createTextNode('CRAsh: syntax error near unexpected token `|`'))
		}
	} else {
		// run each stage left-to-right, threading the previous stage's text as stdin.
		let stdin = null;
		let result = null;
		let failed = false;
		for (let s = 0; s < commands.length; s++) {
			const { command, args } = commands[s];
			const program = resolveCommand(command);
			if (program === null) {
				node.appendChild(document.createTextNode(`CRAsh: ${command}: command not found`))
				failed = true;
				break;
			}
			try {
				result = runProgram(program, args, stdin);
			} catch (err) {
				node.appendChild(document.createTextNode(`CRAsh: ${command}: ${err}`))
				failed = true;
				break;
			}
			if (s < commands.length - 1) stdin = nodeToText(result);
		}
		if (!failed) {
			if (redirect) {
				const err = writeToFile(redirect.target, result, redirect.append);
				if (err) node.appendChild(document.createTextNode(err))
			} else {
				node.appendChild(result)
			}
		}
	}
}
