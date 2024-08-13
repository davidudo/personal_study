import { exec } from 'child_process';
import * as logger from '../logger.js';

class Wallet {
    constructor(options) {
        this.options = options;
    }

    static DETAILS = {
        alias: 'w',
        description: 'wallet',
        commands: ['create'],
        options: {
            create: Boolean
        },
        shorthands: {
            c: ['--create']
        },
        payload(payload, options) {
            options.start = true;
        },
    };

    run() {
        const { options } = this;

        if (options.create) {
            this.runCmd(`curl http://localhost:${options.argv.original[2]}/getWallet`);
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

export { Wallet as Impl };
