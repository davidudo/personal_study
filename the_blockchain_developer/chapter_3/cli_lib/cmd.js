import 'babel-polyfill';
import async from 'async';
import * as base from './base.js';
import fs from 'fs';
import * as logger from './logger.js';
import nopt from 'nopt';
import path from 'path';

// -- Utils ----------------------------------------------------------------------------------------

function hasCommandInOptions(commands, options) {
    if (commands) {
        return commands.some(c => options[c] !== undefined);
    }
    return false;
}

function invokePayload(options, command, cooked, remain) {
    let payload;

    if (command.DETAILS.payload && !hasCommandInOptions(command.DETAILS.commands, options)) {
        payload = [...remain];
        payload.shift();
        command.DETAILS.payload(payload, options);
    }
}

function findCommand(name) {
    let Command, commandDir, commandFiles, commandPath;

    commandDir = path.join(__dirname, 'cmds');
    commandPath = path.join(commandDir, `${name}.js`);

    if (fs.existsSync(commandPath)) {
        Command = require(commandPath).Impl;
    } else {
        commandFiles = base.find(commandDir, /\.js$/i);
        commandFiles.some(file => {
            commandPath = path.join(commandDir, file);
            Command = require(commandPath).Impl;

            if (Command.DETAILS.alias === name) {
                return true;
            }

            Command = null;
            return false;
        });
    }

    return Command;
}

function loadCommand(name) {
    let Command = findCommand(name);
    let plugin;

    // If command was not found, check if it is registered as a plugin.
    if (!Command) {
        try {
            plugin = configs.getPlugin(name);
        } catch (e) {
            return null;
        }

        Command = plugin.Impl;

        // If plugin command exists, register the executed plugin name on
        // process.env. This may simplify core plugin infrastructure.
        process.env.NODEGH_PLUGIN = name;
    }

    return Command;
}

export function setUp() {
    let Command;
    let iterative;
    let operations = [];
    let options;
    let parsed = nopt(process.argv);
    let remain = parsed.argv.remain;
    let cooked = parsed.argv.cooked;

    operations.push(callback => {
        base.checkVersion();
        callback();
    });

    operations.push(callback => {
        let module = remain[0];

        if (cooked[0] === '--version' || cooked[0] === '-v') {
            module = 'version';
        } else if (!remain.length || cooked.includes('-h') || cooked.includes('--help')) {
            module = 'help';
        }

        Command = loadCommand(module);

        if (!Command) {
            logger.error('Command not found');
            return;
        }

        options = nopt(Command.DETAILS.options, Command.DETAILS.shorthands, process.argv, 2);
        iterative = Command.DETAILS.iterative;
        cooked = options.argv.cooked;
        remain = options.argv.remain;
        options.number = options.number || [remain[1]];

        callback();
    });

    async.series(operations, () => {
        let iterativeValues;
        options.isTTY = {
            in: Boolean(process.stdin.isTTY),
            out: Boolean(process.stdout.isTTY),
        };

        // Try to retrieve iterative values from iterative option key,
        // e.g. option['number'] === [1,2,3]. If iterative option key is not
        // present, assume [undefined] in order to initialize the loop.
        iterativeValues = options[iterative] || [undefined];

        iterativeValues.forEach(value => {
            options = base.clone(options);
            options[iterative] = value;
            invokePayload(options, Command, cooked, remain);
            new Command(options).run();
        });
    });
}

export function run() {
    try {
        process.env.GH_PATH = path.join(__dirname, '../');
        setUp();
    } catch (e) {
        console.error(e.stack || e);
    }
}
