function version() {
    return text("shellfish.racing v2.0.0 - 20230629")
}
function help(args) {
    if (args[0] === '--help') {
        return text('HEEEELP ME HEEEELP HEEELP HEEELP I AM STUCK HEEEEEEEELP HELP ME HEEEELP')
    }
    return text(Object.keys(commands).join(", ") +"\n\nuse --help to get more help on a specific command")
}
function echo(args) {return text(args.join(" "))}
function clear() {
    let history = document.getElementById('history')
    while (history.hasChildNodes()) {
        history.removeChild(history.firstChild)
    }
    return text("")
}
function sudo(args) {
    if (args[0] === ("--help")) {
        return text("what am i supposed to say here?")
    }
    if (args != "") {
        try {
            let sCommand = args[0];
            let sArgs = args.slice(1);
            return commands[sCommand](sArgs)
        } catch(err) {
            return text(`bash: sudo ${args}: command not found`)
        }
    } else {
        return text("")
    }
}
function neofetch(args) {
    if (args.includes("--help")) {
        // language=HTML
        return html(`Usage: neofetch [OPTION]...<br>
        Neofetch is a CLI system information tool written in BASH. Neofetch<br>
        displays information about your system next to an image, your OS logo,<br>
        or any ASCII file of your choice.<br><br>
        &nbsp;&nbsp;&nbsp;&nbsp;--fart&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;shittin and fartin`)
    }
    if (args.includes("--fart")) {
        return text("i dont really know what to put here but i wanted another option for neofetch so i mean... yk.. stuff")
    }
    return html(`
        <div class="neofetch">
            <img class="neofetch-img u-logo" src="/k/images/hand.jpg" width="128" height="128" alt="">
            <div class="neofetch-text">
                <b class=""><a href="/k/gpgpub.txt">kiroid</a></b>@<b class="magenta">shellfish.racing</b><br>
                ------------------------<br>
                hey there. i am "big k" "special k" or whatever u call me.
                the internet is crazy, and so i got bored one day so i made this. <br>
                on the topic of THIS stuff, i know a few programming languages (i think.) 
                <b>python, java, javascript, css</b>(?), <b>html</b>(?), <b>bash</b>(?)
                i dunno really. whatever it is, feel free to take a look.
                <br><br>
                <b>pronouns: </b>they/them<br>
                <b>links: </b><a href="https://github.com/kieroid">github</a> <a href="https://open.spotify.com/user/kieranlavato">spotify</a> <a href="/k/gpgpub.txt">pgp</a><br>
                <b>contact: </b><a href="https://discord.com/invite/HynFCu5eax">discord</a> <a href="mailto: k@shellfish.racing">email</a> <a href="https://matrix.to/#/@kiramu:matrix.org">matrix.org</a>
            </div>
        </div>
    `);




}
function text(t) {
    const div = document.createElement('div');
    div.innerText = t;
    return div;
}
function html(t) {
    const div = document.createElement('div');
    div.innerHTML = t;
    return div;
}
function executeCommand(inputText,node) {
    node.appendChild(document.createTextNode(`kira@shellfish.racing ~ $ ${inputText}`))
    node.appendChild(document.createElement("br"))

    const command = inputText.trim().split(' ')[0];
    let args = inputText.trim().split(' ').slice(1);
    if (command !== "") {
        try {
            node.appendChild(commands[command](args))
        } catch(err) {
            node.appendChild(document.createTextNode(`bash: ${command}: command not found`))
        }
    }
}

const commands = {
    "help": help,
    "echo": echo,
    "clear": clear,
    "sudo": sudo,
    "neofetch": neofetch,
    "version": version
};