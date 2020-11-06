const {
    app,
    BrowserWindow,
    Notification,
    globalShortcut,
    Menu,
    Tray,
    ipcMain
} = require("electron");

const path = require("path");
const ejse = require("ejs-electron");
var fs = require("fs");
const Store = require("electron-store");
const store = new Store();
var ip = require("ip");
var home = require("os").homedir();
init();
const express = require("express");
const axios = require('axios');
var CryptoJS = require("crypto-js");
var HTTP = require('http');
const DownloadManager = require("electron-download-manager");
//require("electron-reload")(__dirname);

DownloadManager.register({
    downloadFolder: home + "/pictures/Wallpapers/"
});

const template = [{
        label: "Bem-Vindo",
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { role: 'togglefullscreen' }
        ]
    }
    /*{
        label: "Outros",
        submenu: [{
                role: "reload"
            },
            {
                role: "forcereload"
            },
            {
                role: "toggledevtools"
            },
            {
                role: "togglefullscreen"
            },
        ],
    },*/
];

const menu = Menu.buildFromTemplate(template);

async function init() {
    if (!fs.existsSync(home + "/pictures/Wallpapers")) {
        fs.mkdirSync(home + "/pictures/Wallpapers");
    }
    let mainWindow,
        windowParams = {
            width: 1300,
            height: 730,
            minHeight: 600,
            minWidth: 1100,
            show: true,
            backgroundColor: "#222",
            enableRemoteModule: true,
            frame: false,
            icon: __dirname + "/imgs/logo.ico",
            titleBarStyle: "hidden",
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                webSecurity: false,
                enableRemoteModule: true,
                devTools: true
            }
        };

    function createWindow() {
        mainWindow = new BrowserWindow(windowParams);

        mainWindow.on('close', (e) => {
            mainWindow = null;
        });

        mainWindow.loadURL(`file://${__dirname}/index.ejs`);

        Menu.setApplicationMenu(menu);

        mainWindow.webContents.on("did-finish-load", () => {
            mainWindow.show();

            let contents = mainWindow.webContents;
        });

        mainWindow.on("closed", function () {
            mainWindow = null;
        });
    }
    app.whenReady().then(createWindow);

    app.on("ready", () => {

    });

    app.on("window-all-closed", function () {
        app.quit();
    });

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0 || mainWindow === null)
            createWindow();
    });
}