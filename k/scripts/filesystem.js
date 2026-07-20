// the whole "file system" is just this object.
// a directory is a plain object, a static file is a DOM node (html(...)),
// and a program is a function that returns a node. commands live in /bin.
const PATH = ['/bin'];

const filesystem = {
	"about.txt": html("testing"),
	"bin": {
		"ls": ls,
		"cd": cd,
		"cat": cat,
		"pwd": pwd,
		"joefetch": joefetch,
		"clear": clear,
		"exit": exit
	}
};

// where we currently are, as an array of directory names from root.
let cwd = [];

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
