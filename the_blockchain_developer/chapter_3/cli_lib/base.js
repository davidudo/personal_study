import fs from 'fs';
import path from 'path';
import updateNotifier from 'update-notifier';

// -- Config -------------------------------------------------------------------

export function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

// -- Utils --------------------------------------------------------------------

export function load() {
    function paginate(method) {
        return function paginatedMethod(payload, cb) {
            let results = [];

            const getSubsequentPages = (link, pagesCb) => {
                pagesCb();
            };

            method(payload, (err, res) => {
                if (err) {
                    return cb(err, null);
                }

                if (!Array.isArray(res)) {
                    return cb(err, res);
                }

                results = res;

                getSubsequentPages(res.meta.link, (err) => {
                    cb(err, results);
                });
            });
        };
    }
}

export function asyncReadPackages(callback) {
    function async(err, data) {
        if (err) {
            throw err;
        }

        callback(JSON.parse(data));
    }

    fs.readFile(path.join(__dirname, '..', 'package.json'), async);
}

export function notifyVersion(pkg) {
    const notifier = updateNotifier({ pkg: pkg });

    if (notifier.update) {
        notifier.notify();
    }
}

export function checkVersion() {
    asyncReadPackages(notifyVersion);
}

export function find(filepath, opt_pattern) {
    return fs.readdirSync(filepath).filter((file) => {
        return (opt_pattern || /.*/).test(file);
    });
}
