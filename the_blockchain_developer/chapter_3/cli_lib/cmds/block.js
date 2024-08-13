'use strict';

import { exec } from 'child_process';
import logger from '../logger.js';

class Block {
    constructor(options) {
        this.options = options;
    }

    static DETAILS = {
        alias: 'b',
        description: 'block',
        commands: ['get', 'all'],
        options: {
            create: Boolean,
        },
        shorthands: {
            s: ['--get'],
            a: ['--all'],
        },
        payload: function(payload, options) {
            options.start = true;
        },
    };

    run() {
        const options = this.options;

        // console.log('---> blocks: ' + JSON.stringify(options.argv.original[2]));

        if (options.get) {
            this.runCmd(`curl http://localhost:${options.argv.original[2]}/getBlock?index=${options.argv.original[3]}`);
        }

        if (options.all) {
            this.runCmd(`curl http://localhost:${options.argv.original[2]}/blocks`);
        }
    }

    runCmd(cmd) {
        logger.log(cmd);
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                logger.log(`err: ${err}`);
                return;
            }
            logger.log(`stdout: ${stdout}`);
        });
    }
}

export default Block;
