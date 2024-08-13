import * as base from '../base.js';
import * as logger from '../logger.js';

class Version {
    static DETAILS = {
        alias: 'v',
        description: 'Version.',
    };

    run() {
        base.asyncReadPackages(this.printVersion);
    }

    printVersion(pkg) {
        logger.log(`${pkg.name} ${pkg.version}`);
    }
}

export { Version as Impl };
