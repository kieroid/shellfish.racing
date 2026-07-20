// the whole "file system" is just this object.
// a directory is a plain object, a static file is a DOM node (html(...)),
// and a program is a function that returns a node. commands live in /bin.
const PATH = ['/bin'];

// programs are functions; they can't be persisted, so they live only in code
// and get (re-)injected into /bin on every load.
const programs = {
	"ls": ls,
	"cd": cd,
	"cat": cat,
	"pwd": pwd,
	"joefetch": joefetch,
	"clear": clear,
	"touch": touch,
	"mkdir": mkdir,
	"rm": rm,
	"rmdir": rmdir
};

let filesystem = {
	"about.txt": html("testing"),
	"bin": Object.assign({}, programs)
};

// where we currently are, as an array of directory names from root.
let cwd = [];

// restore any files/dirs the user created on a previous visit.
loadFilesystem();

// the current directory as a "/"-path string ("/", "/bin", "/a/b", ...).
function currentPath() {
	return '/' + cwd.join('/');
}

// a directory is a plain object; anything else (a DOM node or a program) is a file.
function isDirectory(node) {
	return node !== null && typeof node === 'object' && !(node instanceof Node);
}

// turn a path (absolute or relative) into { segments, node }, or null if it
// does not exist. handles "." and "..".
function resolvePath(input) {
	let segments = input.startsWith('/') ? [] : cwd.slice();
	for (const part of input.split('/')) {
		if (part === '' || part === '.') continue;
		if (part === '..') { segments.pop(); continue; }
		segments.push(part);
	}
	let node = filesystem;
	for (const seg of segments) {
		if (!isDirectory(node) || !Object.prototype.hasOwnProperty.call(node, seg)) {
			return null;
		}
		node = node[seg];
	}
	return { segments, node };
}

// find a runnable program by name: an explicit path, or a bare name searched
// across PATH. returns the program function, or null if not found/not runnable.
function resolveCommand(name) {
	if (name.includes('/')) {
		const r = resolvePath(name);
		return r && typeof r.node === 'function' ? r.node : null;
	}
	for (const dir of PATH) {
		const r = resolvePath(`${dir}/${name}`);
		if (r && typeof r.node === 'function') return r.node;
	}
	return null;
}

// longest common prefix of a list of strings.
function longestCommonPrefix(strs) {
	let prefix = strs[0];
	for (const s of strs) {
		while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
	}
	return prefix;
}

// tab completion: given the full input line, return { text, options } or null.
// text = the (possibly completed) line; options = candidate names to show when
// the match is ambiguous and cannot be extended any further.
function completeInput(value) {
	const lastSpace = value.lastIndexOf(' ');
	const head = value.slice(0, lastSpace + 1);
	const token = value.slice(lastSpace + 1);

	// first word with no slash -> complete a command name from PATH.
	const isCommand = lastSpace === -1 && !token.includes('/');
	let dirPart = '';
	let base = token;
	let entries = [];
	let parent = null;

	if (isCommand) {
		for (const dir of PATH) {
			const r = resolvePath(dir);
			if (!r || !isDirectory(r.node)) continue;
			for (const name of Object.keys(r.node)) {
				if (typeof r.node[name] === 'function' && !entries.includes(name)) {
					entries.push(name);
				}
			}
		}
	} else {
		const lastSlash = token.lastIndexOf('/');
		dirPart = token.slice(0, lastSlash + 1);
		base = token.slice(lastSlash + 1);
		const r = resolvePath(dirPart === '' ? '.' : dirPart);
		if (!r || !isDirectory(r.node)) return null;
		parent = r.node;
		entries = Object.keys(parent);
	}

	const matches = entries.filter(name => name.startsWith(base));
	if (matches.length === 0) return null;

	if (matches.length === 1) {
		const name = matches[0];
		const suffix = (!isCommand && isDirectory(parent[name])) ? '/' : ' ';
		return { text: head + dirPart + name + suffix, options: null };
	}

	// several matches: extend to their common prefix, or list them if we can't.
	const lcp = longestCommonPrefix(matches);
	if (lcp.length > base.length) {
		return { text: head + dirPart + lcp, options: null };
	}
	return { text: value, options: matches };
}

// --- persistence -----------------------------------------------------------

// resolve the parent directory of a path plus the final name, for creating a
// new entry there. returns { parent, name } or null if the parent isn't a dir.
function resolveParent(input) {
	const trimmed = input.replace(/\/+$/, '');
	const idx = trimmed.lastIndexOf('/');
	const parentPath = idx === -1 ? '.' : (idx === 0 ? '/' : trimmed.slice(0, idx));
	const name = trimmed.slice(idx + 1);
	if (name === '' || name === '.' || name === '..') return null;
	const r = resolvePath(parentPath);
	if (!r || !isDirectory(r.node)) return null;
	return { parent: r.node, name };
}

// after a removal, make sure cwd still points at a real directory; walk up to
// the nearest surviving ancestor (root at worst) so the prompt never strands.
function normalizeCwd() {
	while (cwd.length > 0 && resolvePath('/' + cwd.join('/')) === null) {
		cwd.pop();
	}
}

// turn the live filesystem into a JSON-safe tree: directories become { d: {...} },
// files keep their html as { f: "..." }, and programs (functions) are dropped.
function serializeFs(node) {
	if (typeof node === 'function') return undefined;
	if (isDirectory(node)) {
		const children = {};
		for (const key of Object.keys(node)) {
			const child = serializeFs(node[key]);
			if (child !== undefined) children[key] = child;
		}
		return { d: children };
	}
	return { f: node.innerHTML };
}

// rebuild a filesystem node from serializeFs output.
function deserializeFs(obj) {
	if (obj && typeof obj === 'object') {
		if (obj.d !== undefined) {
			const dir = {};
			for (const key of Object.keys(obj.d)) {
				dir[key] = deserializeFs(obj.d[key]);
			}
			return dir;
		}
		if (obj.f !== undefined) return html(obj.f);
	}
	return html('');
}

function saveFilesystem() {
	try {
		localStorage.setItem('shellfish.fs', JSON.stringify(serializeFs(filesystem)));
	} catch (e) { /* localStorage unavailable or full: stay in-memory */ }
}

function loadFilesystem() {
	let saved;
	try {
		saved = localStorage.getItem('shellfish.fs');
	} catch (e) {
		return;
	}
	if (saved) {
		try {
			const restored = deserializeFs(JSON.parse(saved));
			if (isDirectory(restored)) filesystem = restored;
		} catch (e) { /* corrupt data: fall back to the built-in filesystem */ }
	}
	// programs never persist, so make sure /bin always has the real ones.
	if (!isDirectory(filesystem.bin)) filesystem.bin = {};
	Object.assign(filesystem.bin, programs);
}
