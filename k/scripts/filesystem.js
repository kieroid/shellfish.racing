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
		"help": help,
		"clear": clear,
		"exit": exit
	}
};

// where we currently are, as an array of directory names from root.
let cwd = [];

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
