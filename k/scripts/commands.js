//so if you didn't know, this is my first time doing javascript.
//yeah, no. im kind of dumb. you will see many errors, many
//repeatitive if statements, and a slow webpage. oh well.
//feel free to take my code. its on the github too.
//like you'd want it anyway...
function cat(args) {
    if (args.includes("--help")) {
        return html(`Usage: cat [OPTION]... [FILE]...<br>
Concatenate FILE(s) to standard output.`)
    }
    
    if (args.includes("albums"))  {
        return html(`favorite albums:<br>
            black midi - Hellfire<br>
	    Kero Kero Bonito - Time 'n' Place<br>
	    Kero Kero Bonito - Civilization<br>
	    Ichiko Aoba - Windswept Adan<br>
	    Tatsuro Yamashita - Softly<br>
	    Death Grips - The Money Store<br>
	    Liturgy - 93696<br>
	    Fiona Apple - Fetch The Bolt Cutters<br>
	    Fiona Apple - The Idler Wheel...<br>
	    Car Seat Headrest - Twin Fantasy<br>
	    Irving Gordon - Gordon<br>
	    SE SO NEON - Nonadaptation<br>
	    Phoebe Bridgers - Punisher<br>
	    Soccer Mommy - Sometimes, Forever<br>
	    Radiohead - OK Computer<br>
	    Radiohead - In Rainbows<br>
	    Black Country, New Road - Ants From Up There<br>
	    The Armed - Perfect Saviors<br>
	    The Armed - ULTRAPOP<br>
	    Lingua Ignota - SINNER GET READY<br>
	    Mitski - Be The Cowboy<br>
	    Adrianne Lenker - songs<br>
	    Fleet Foxes - Helplessness Blues<br>
	    Dr. Dog - Shame, Shame
	    `)
    }

    if (args.includes(".steam"))  {
        return html(`here is my <a href="https://steamcommunity.com/id/groupshift/">steam</a>`)
    }
    
    if (args != "") {
        return html(`cat: file ${args[0]} does not exist`)
    }
    return html("cat: missing file operand")
}
function ls(args) {
    if (args.includes("--help")) {
        return html(`Usage: ls [OPTION]... [FILE]...<br>
List information about the FILEs (the current directory by default).<br><br>
Mandatory arguments to long options are mandatory for short options too.<br>
&nbsp;&nbsp;&nbsp;&nbsp;-a, --all do not ignore entries starting with .`)
    }
    if (args.includes("-a") || args.includes("--all"))  {
        return html(`albums .steam`)
    }

    return html(`albums`)
}
function exit(args) {
    //help flag
    if (args.includes("--help")) {
        return html(`exit: exit<br>
        Exit the shell.`)
    }

    //password menu
    let overall = document.getElementById('parent')
    while (overall.hasChildNodes()) {
        overall.removeChild(overall.firstChild)
    }
    let labelElement = document.createElement("label")
    let passwordElement = document.createElement("input")
    overall.appendChild(labelElement)
    overall.appendChild(passwordElement)
    labelElement.innerHTML = "Password: "
    passwordElement.setAttribute("id","passwordElement")
    passwordElement.focus()

    //do not look (lolol)
    const locations = {
	"2016": 'https://www.youtube.com/watch?v=QF_rMivCwmk',
        "2022": 'https://www.youtube.com/watch?v=b_S-ecnq6j4',
    };
    document.addEventListener("keydown", function(e) {
        if (e.key === 'Enter') {
            if (locations[passwordElement.value] != undefined) {window.location.href = locations[passwordElement.value]}
            passwordElement.value = "";
        }
    })
}
function help(args) {
    if (args[0] === '--help') {
        return html('HEEEELP ME HEEEELP HEEELP HEEELP I AM STUCK HEEEEEEEELP HELP ME HEEEELP')
    }
    return html(Object.keys(commands).join(", ") +"\n\nuse --help to get more help on a specific command")
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
        return html(`
        <div class="neofetch">
            <img class="neofetch-img u-logo" src="/k/images/groggy.png" width="128" height="128" alt="">
            <div class="neofetch-text">
                <b class=""><a href="/k/gpgpub.txt">corrin</a></b>@<b class="magenta">shellfish.racing</b><br>
                ------------------------<br>
                fart fart fart, poop poop. fart poop.<br>
                poop is funny<br>
                poop and fart poop<br>
                farting is funny (farts are funny) fart fart<br>
                fart
                <br><br>
                <b>links: </b><a href="https://github.com/kieroid">github</a> <a href="https://open.spotify.com/user/kieranlavato">spotify</a><br>
                <b>contact: </b> <a href="mailto: k@shellfish.racing">email</a> <a href="https://matrix.to/#/#chat:shellfish.racing">matrix</a> <a href="https://discord.com/invite/BDzxE7n4jR">discord</a>
            </div>
        </div>
        `)
    }
    return html(`
        <div class="neofetch">
            <img class="neofetch-img u-logo" src="/k/images/a.jpg" width="128" height="128" alt="">
            <div class="neofetch-text">
                <b class=""><a href="/k/gpgpub.txt">kieran</a></b>@<b class="magenta">shellfish.racing</b><br>
                ------------------------<br>
                <a href="https://www.coreboot.org/">coreboot</a> and linux enthusiast<br>
		ceo of swag, founder of apple, inventor of the wheel.<br>
		i am a nerd, loser, and an agnostic earth creature.<br>
		i enjoy doing things that people dont enjoy.<br>
                thats about it!
		<br><br>
                <b>links: </b><a href="https://github.com/kieroid">github</a> <a href="https://open.spotify.com/user/kieranlavato">spotify</a><br>
                <b>contact: </b><a href="mailto: k@shellfish.racing">email</a> <a href="https://matrix.to/#/#chat:shellfish.racing">matrix</a> <a href="https://discord.com/invite/BDzxE7n4jR">discord</a>
            </div>
        </div>
    `);




}
function echo(args) {return html(args.join(" "))}
function sudo(args) {
    if (args[0] === ("--help")) {
        return html("what am i supposed to say here?")
    }
    if (args != "") {
        try {
            let sCommand = args[0];
            let sArgs = args.slice(1);
            return commands[sCommand](sArgs)
        } catch(err) {
            return html(`bash: sudo ${args}: command not found`)
        }
    } else {
        return html("")
    }
}
function clear() {
    let history = document.getElementById('history')
    while (history.hasChildNodes()) {
        history.removeChild(history.firstChild)
    }
    return html("")
}
function html(t) {
    const div = document.createElement('div');
    div.innerHTML = t;
    return div;
}
function executeCommand(inputText,node) {
    node.appendChild(document.createTextNode(`kieran@shellfish.racing ~ $ ${inputText}`))
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
    "exit": exit,
    "ls": ls,
    "cat": cat
};
