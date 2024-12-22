let messageHistory = [];
let n = 0;

let joefetchFirst = document.createElement("li")
executeCommand('joefetch',joefetchFirst)
messageHistory.push("joefetch")
document.getElementById("history").appendChild(joefetchFirst)

document.addEventListener("keydown", function(e) {
    if (e.key === 'Enter') {
        //input
        let input = document.getElementById("commandinput")
        let node = document.createElement("li")
        let inputText = input.value;
        input.value = "";


        executeCommand(inputText,node)

        //appending commands
        messageHistory.push(inputText)
        document.getElementById("history").appendChild(node);

        //remove start text
        if (n === 0) {
            document.getElementById("inputMessage").style.visibility = "hidden";
            n = 1;
        }
    }
});
