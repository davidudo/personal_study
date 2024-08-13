'use strict';

import { find } from '../base.js';
import logger from '../logger.js';
import nopt from 'nopt';
import path from 'path';
import { Stream } from 'stream';
import { URL } from 'url';
import wordwrapPkg from 'wordwrap';

const { hard: wordwrap } = wordwrapPkg;

class Help {
    constructor() {
        this.options = nopt(Help.DETAILS.options, Help.DETAILS.shorthands, process.argv, 2);
    }

    static DETAILS = {
        description: 'List all commands and options available.',
        options: {
            all: Boolean,
            help: Boolean,
        },
        shorthands: {
            a: ['--all'],
            h: ['--help'],
        },
    };

    run() {
        const instance = this;
        const commands = [];
        const cmdDir = path.join(__dirname, '../cmds/');
        const files = find(cmdDir, /\.js$/);
        let filter;
        const options = this.options;

        files.splice(files.indexOf('help.js'), 1);
        files.splice(files.indexOf('version.js'), 1);
        filter = options.argv.remain[0];

        if (filter === 'help') {
            filter = options.argv.remain[1];
        }

        files.forEach(function (dir) {
            const cmd = require(path.resolve(cmdDir, dir));
            const alias = cmd.Impl.DETAILS.alias || '';
            let flags = [];
            const name = path.basename(dir, '.js').replace(/^cli-/, '');
            let offset = 20 - alias.length - name.length;

            if (offset < 1) offset = 1;

            if (offset !== 1 && alias.length === 0) offset += 2;

            if (filter && filter !== alias && filter !== name) return;

            if (filter || options.all) {
                flags = instance.groupOptions_(cmd.Impl.DETAILS);
                offset = 1;
            }

            commands.push({
                alias: alias,
                description: cmd.Impl.DETAILS.description,
                flags: flags,
                name: name,
                offset: new Array(offset + 1).join(' '),
            });
        });

        if (filter && commands.length === 0) {
            logger.error('No manual entry for ' + filter);
            return;
        }

        logger.log(this.listCommands_(commands));
    }

    listFlags_(command) {
        const flags = command.flags;
        let content = '';

        flags.forEach(function (flag) {
            content += '    ';

            if (flag.shorthand) content += '-' + flag.shorthand + ', ';

            content += '--' + flag.option;

            if (flag.cmd) content += '*';

            if (flag.type) content += logger.colors.cyan(' (' + flag.type + ')');

            content += '\n';
        });

        if (flags.length !== 0) content += '\n';

        return content;
    }

    listCommands_(commands) {
        let content =
            'usage: cli <command> [payload] [--flags] [--verbose] [--no-hooks]\n\n';
        content += 'List of available commands:\n';

        for (const pos in commands) {
            if (commands.hasOwnProperty(pos)) {
                const command = commands[pos];
                content += '  ';

                if (command.alias) content += logger.colors.magenta(command.alias) + ', ';

                content +=
                    logger.colors.magenta(command.name) +
                    command.offset +
                    command.description +
                    '\n';

                content += this.listFlags_(command);
            }
        }

        content +=
            '\n(*) Flags that can execute an action.\n' +
            "'cli help' lists available commands.\n" +
            "'cli help -a' lists all available subcommands.\n" +
            "On mac add to '/.bash_profile' >  alias cli='node /[location]/bin/cli.js' \n" +
            "than use 'cli' alias >cli help";

        return content;
    }

    groupOptions_(details) {
        const instance = this;
        const grouped = [];
        const options = Object.keys(details.options);
        const shorthands = Object.keys(details.shorthands);

        options.forEach(function (option) {
            let foundShorthand;
            let type;

            shorthands.forEach(function (shorthand) {
                const shorthandValue = details.shorthands[shorthand][0];

                if (shorthandValue === '--' + option) foundShorthand = shorthand;
            });

            const cmd = instance.isCommand_(details, option);
            type = instance.getType_(details.options[option]);

            grouped.push({
                cmd: cmd,
                option: option,
                shorthand: foundShorthand,
                type: type,
            });
        });

        return grouped;
    }

    getType_(type) {
        if (Array.isArray(type)) {
            const types = type.slice(0, -1);
            return types.map(eachType => this.getType_(eachType)).join(', ');
        }

        switch (type) {
            case String:
                return 'String';
            case URL:
                return 'Url';
            case Number:
                return 'Number';
            case path:
                return 'Path';
            case Stream:
                return 'Stream';
            case Date:
                return 'Date';
            case Boolean:
                return 'Boolean';
            default:
                return '';
        }
    }

    isCommand_(details, option) {
        return details.commands && details.commands.includes(option);
    }
}

export default Help;
