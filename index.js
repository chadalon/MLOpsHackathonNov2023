// const {ipcRenderer} = window;
const fs = require("fs");
const { ipcRenderer } = require("electron");
var fileInp = document.getElementById("fileInp");
var outputBox = document.getElementById("output");
var listenContribute = document.getElementById("listenContribute");
var fillerWords = document.getElementById("fillerWords");
var resilience = document.getElementById("resilience");
const { PythonShell } = require("python-shell");
function setOutput(dat) {
  outputBox.innerText = dat;
}
let presentation = document.getElementById("presentation");
function submitDat() {
  if (fileInp.files.length === 0) {
    setOutput("Please choose a file.");
    return;
  }
  let question = "";
  if (presentation.checked) {
    if (question !== "") question += "\nAlso, ";
    question +=
      "Please give a short one-sentence summary of how well each person's presentation is.\n";
  }
  if (fillerWords.checked) {
    if (question !== "") question += "\nAlso, ";
    question +=
      "In this interaction, please count each speaker's rate of filler words per phrase. In your response to this, only present the data, and no explanatory commentary.\n";
  }
  if (resilience.checked) {
    if (question !== "") question += "\nAlso, ";
    question +=
      "In the interaction, please consider the statements that might hurt a sensivtive person's feelings, such as criticism of work, business, rudeness, or impatience, but where the receiver's response is calm, measured, or professional. Give these measurements in a short sentence.\n";
  }
  if (question === "") {
    if (listenContribute.checked) {
      setOutput("Processing...");
      ipcRenderer.send("sendit", ["", "", listenContribute.checked]);

      return;
    }
    setOutput("Please select a skill to analyze.");
    return;
  }
  question =
    "I am giving you a conversation between engineers at a tech company.\n" +
    question;

  // var file = fs.readFileSync(fileInp.files[0].path).toString();
  setOutput("Processing...");
  ipcRenderer.send("sendit", [
    question,
    fileInp.files[0].path.toString(),
    listenContribute.checked,
  ]);
}
ipcRenderer.on("gpt", (e, msg) => {
  let outStr = msg[0] + "\n\n";
  if (msg[1]) {
    // listen contribute
    let pyshell = new PythonShell("listen_contribute.py");
    // YO THIS FILEPATH CAN BE CHANGED DURING PROCESSING
    pyshell.send(fileInp.files[0].path.toString());
    pyshell.on("message", function (message) {});
    pyshell.end(function (err) {
      if (err) {
        throw err;
      }
      let f = fs
        .readFileSync("speaker_contributions.txt")
        .toString()
        .split("\n");
      for (let i = 0; i < f.length; i++) {
        f[i] = f[i].slice(0, -1);
      }
      for (let i = 1; i < f.length; i++) {
        if (f[i] == "" || f[i] == "\n") continue;
        let dat = f[i].split(",");
        outStr += `Speaker ${dat[0]} listened ${dat[1]} of the time and contributed ${dat[2]} of the time.\n\n`;
      }
      console.log(outStr);
      setOutput(outStr);
    });
  }
  console.log("settinghere");
  setOutput(outStr);
});
document.getElementById("run").addEventListener("click", () => submitDat());
