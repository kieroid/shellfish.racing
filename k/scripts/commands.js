//so if you didn't know, this is my first time doing javascript.
//yeah, no. im kind of dumb. you will see many errors, many
//repeatitive if statements, and a slow webpage. oh well.
//feel free to take my code. its on the github too.
//like you'd want it anyway...
function ls(args) {
    if (args.includes("--help")) {
        return html(`Usage: ls [OPTION]... [FILE]...<br>
List information about the FILEs (the current directory by default).<br><br>
Mandatory arguments to long options are mandatory for short options too.<br>
&nbsp;&nbsp;&nbsp;&nbsp;-a, --all do not ignore entries starting with .`)
    }
    if (args.includes("--help")) {
        return html(`Usage: ls [OPTION]... [FILE]...<br>
List information about the FILEs (the current directory by default).<br><br>
Mandatory arguments to long options are mandatory for short options too.<br>
&nbsp;&nbsp;&nbsp;&nbsp;-a, --all do not ignore entries starting with .`)
    }
}
function exit(args) {
    //help flag
    if (args.includes("--help")) {
        return html(`exit: exit<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Exit the shell.<br>&nbsp;&nbsp;&nbsp;&nbsp;(This isn't for you. This is for me.)`)
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

    //variety of answers. the average person wont see this but there is a face reveal.
    //if u find this pls dont tell anyone. i like keeping it a secret.
    document.addEventListener("keyup", function(e) {
        if (e.key === 'Enter') {
            if (passwordElement.value === "dread") { //i like this song. makes me sad
                window.location.href = 'https://www.youtube.com/watch?v=ZwxDm1p-7To';
            }
            if (passwordElement.value === "2016") { //seventh grade was a mystery
                window.location.href = 'https://www.youtube.com/watch?v=QF_rMivCwmk';
            }
            if (passwordElement.value === "2022") { //this was for my english class. kind of sucks
                window.location.href = 'https://www.youtube.com/watch?v=b_S-ecnq6j4';
            }
            if (passwordElement.value === "dumb") { //omg!! you are so smart. im not. im dumb. im stupid
                window.location.href = 'https://governor.nc.gov/news/press-releases/2021/06/03/18-nc-high-school-students-named-national-cyber-scholars-after-winning-nationwide-cybersecurity';
            }
            if (passwordElement.value === "lena") { //lenas page
                window.location.href = '/lena/index.html';
            }
            if (passwordElement.value === "ari") { //lenas page
                window.location.href = '/lena/index.html';
            }
            if (passwordElement.value === "glaggle") { //lenas page
                window.location.href = '/glaggle/index.html';
            }
        }
    })
}
function version() {
    return text("shellfish.racing v3.0.0 - 20230629")
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
    "version": version,
    "exit": exit
};