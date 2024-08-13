'use strict';

import fs from 'fs';
import handlebars from 'handlebars';
import moment from 'moment';
import path from 'path';
import colors from 'colors/safe.js';
import _ from 'lodash';
import wordwrapPkg from 'wordwrap';

const { hard: wordwrap } = wordwrapPkg;

const logger = {};

function stripHandlebarsNewLine(str) {
    return str.replace(/[\s\t\r\n](\{\{[#\/])/g, '$1');
}

logger.debug = function() {
    if (!process.env.GH_VERBOSE) {
        return;
    }

    if (typeof arguments[0] === 'string') {
        arguments[0] = 'DEBUG: ' + arguments[0];
        console.log.apply(this, arguments);
        return;
    }

    console.log('DEBUG:');
    console.log.apply(this, arguments);
};

logger.insane = function() {
    if (!process.env.GH_VERBOSE_INSANE) {
        return;
    }

    console.log.apply(this, arguments);
};

logger.error = function() {
    if (typeof arguments[0] === 'string') {
        arguments[0] = 'fatal: ' + arguments[0];
    }

    console.error.apply(this, arguments);
    process.exit(1);
};

logger.warn = function() {
    arguments[0] = 'warning: ' + arguments[0];
    console.error.apply(this, arguments);
};

logger.log = function() {
    console.log.apply(this, arguments);
};

logger.getDuration = function(start, opt_end = Date.now()) {
    return moment.duration(moment(start).diff(opt_end)).humanize(true);
};

logger.applyReplacements = function(output, replaceMap) {
    let regexPattern;

    for (regexPattern in replaceMap) {
        if (replaceMap.hasOwnProperty(regexPattern)) {
            output = output.replace(new RegExp(regexPattern, 'g'), replaceMap[regexPattern]);
        }
    }

    return output;
};

logger.getErrorMessage = function(err) {
    let msg;

    if (!err) {
        return 'No error message.';
    }

    if (err.errors) {
        return err.errors;
    }

    if (!err.message) {
        return err;
    }

    try {
        msg = JSON.parse(err.message);
    } catch (e) {
        return err.message;
    }

    if (typeof msg === 'string') {
        return msg;
    }

    if (msg.errors && msg.errors[0] && msg.errors[0].message) {
        return msg.errors[0].message;
    }

    if (msg.message) {
        return msg.message;
    }

    return err.message.replace('Command failed: fatal: ', '').trim();
};

logger.compileTemplate = function(source, map) {
    const template = handlebars.compile(source);
    return logger.applyReplacements(template(map));
};

logger.logTemplate = function(source, map = {}) {
    console.log(logger.compileTemplate(source, map));
};

logger.logTemplateFile = function(file, map) {
    let templatePath = path.join(file);

    if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'cmds/templates', file);
    }

    const source = fs.readFileSync(templatePath).toString();
    logger.logTemplate(stripHandlebarsNewLine(source), map);
};

logger.registerHelper = function(name, callback) {
    handlebars.registerHelper(name, callback);
};

logger.registerHelpers_ = function() {
    handlebars.registerHelper('date', function(date) {
        return logger.getDuration(date);
    });

    handlebars.registerHelper('compareLink', function() {
        return (
            this.options.github_host +
            this.options.user +
            '/' +
            this.options.repo +
            '/compare/' +
            this.options.pullHeadSHA +
            '...' +
            this.options.currentSHA
        );
    });

    handlebars.registerHelper('forwardedLink', function() {
        return (
            this.options.github_host +
            this.options.fwd +
            '/' +
            this.options.repo +
            '/pull/' +
            this.options.forwardedPull
        );
    });

    handlebars.registerHelper('link', function() {
        return (
            this.options.github_host +
            this.options.user +
            '/' +
            this.options.repo +
            '/pull/' +
            this.options.number
        );
    });

    handlebars.registerHelper('submittedLink', function() {
        return (
            this.options.github_host +
            this.options.submit +
            '/' +
            this.options.repo +
            '/pull/' +
            this.options.submittedPull
        );
    });

    handlebars.registerHelper('issueLink', function() {
        return (
            this.options.github_host +
            this.options.user +
            '/' +
            this.options.repo +
            '/issues/' +
            this.options.number
        );
    });

    handlebars.registerHelper('gistLink', function() {
        return this.options.github_gist_host + this.options.loggedUser + '/' + this.options.id;
    });

    handlebars.registerHelper('repoLink', function() {
        return this.options.github_host + this.options.user + '/' + this.options.repo;
    });

    handlebars.registerHelper('wordwrap', function(text, padding, stripNewLines = true) {
        let gutter = '';

        if (stripNewLines !== false) {
            text = text.replace(/[\r\n\s\t]+/g, ' ');
        }

        text = wordwrap(text).split('\n');

        if (padding > 0) {
            gutter = new Array(padding).join(' ');
        }

        return text.join('\n' + gutter);
    });
};

logger.registerHelpers_();

logger.colors = colors;

if (process.argv.indexOf('--no-color') !== -1) {
    logger.colors = _.reduce(
        _.keys(logger.colors.styles),
        (memo, color) => {
            memo[color] = function returnValue(value) {
                return value;
            };

            return memo;
        },
        {}
    );
}

export default logger;
