const { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
const { PythonShell } = require("python-shell");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const apiKey = fs.readFileSync("apiKey.txt").toString();
const client = axios.create({
  headers: { Authorization: "Bearer " + apiKey },
});
let mainWindow;
let listenContribute = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});

let myObj = {};
function readDialogues() {
  let dat = fs.readFileSync("all_dialogues_readable.txt").toString();
  let lines = dat.split("\n");
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].slice(0, -1);
  }
  // console.log(lines);
  let curKey = "";
  let accumulator = [];
  for (let i = 0; i < lines.length; i++) {
    if (i !== 0 && lines[i].includes(".json")) {
      if (curKey !== "") {
        myObj[curKey] = accumulator;
        accumulator = [];
      }
      curKey = lines[i];
      continue;
    }
    if (lines[i] !== "" && curKey !== "") {
      accumulator.push(lines[i]);
    }
  }
  myObj[curKey] = accumulator;
  // console.log(myObj);
}
readDialogues();
/**
 * allhands.json
 * filler words
 * rate each member of this conversation based on how many unnecessary filler words or phrases they use per sentence.
 */
function askGod(question) {
  const params = {
    messages: [{ role: "user", content: question }],
    model: "gpt-3.5-turbo",
  };
  client
    .post("https://api.openai.com/v1/chat/completions", params)
    .then((result) => {
        mainWindow.webContents.send('gpt', [result.data.choices[0].message.content, listenContribute]);
      console.log(result.data);
      console.log(result.data.choices[0].message);
    })
    .catch((err) => {
      console.log(err);
    });
}
function convertToString(thing) {
  let s = "";
  for (let i = 0; i < thing.length; i++) {
    s += thing[i] + "\n";
  }
  return s;
}
// console.log(myObj['all_hands.json']);
let question = `
I am going to feed you a conversation between engineers at a tech company.
Rate each member of this conversation based on how many unnecessary filler words or phrases they use per sentence:

`;
question += convertToString(myObj["all_hands.json"]);
// askGod(question);

ipcMain.on("sendit", (e, msg) => {
    if (msg[0] === "")
    {
        mainWindow.webContents.send('gpt', ["", true]);
        return;
    }
    let file = msg[1];
    listenContribute = msg[2];
  let pyshell = new PythonShell("format_json_for_api.py");
  console.log(file);
  pyshell.send(file);
  pyshell.on("message", function (message) {
    console.log(message);
  });
  pyshell.end(function (err) {
    if (err) {
      throw err;
    }
    let fileDat = '\n' + fs.readFileSync('output.txt').toString();
    console.log(msg[0] + fileDat);
    askGod(msg[0] + fileDat)
  });
});

