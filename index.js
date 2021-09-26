/**
 * @type {{showErrorToClient: boolean, crashEnabled: boolean, logErrorsToConsole: boolean, directory: string}}
 */
const options = {
    directory: "",
    crashEnabled: false,
    logErrorsToConsole: true,
    showErrorToClient: true,
};

/*** @type {function(req: Request, res: Response, err: Error)[]} */
const onError = [];

/**
 * @param {string} code
 * @param {Object} variables
 */
const evalCode = (code, variables = {}) => {
    return eval(`${Object.keys(variables).map(key => `const ${key} = variables["${key.replace(`"`, `\\"`)}"];`).join("")}${code}`);
};

module.exports = {
    /**
     * @param {function(req: Request, res: Response, err: Error)} callable
     */
    addErrorListener(callable) {
        onError.push(callable);
    },
    /**
     * @param {string} value - Directory that will be used in rendering.
     * */
    setDirectory(value) {
        options.directory = value;
    },
    /**
     * @param {boolean} value - Will it crash if an error occurs?
     * */
    setCrashesEnabled(value = true) {
        options.crashEnabled = value;
    },
    /**
     * @param {boolean} value - Will it log errors to console?
     * */
    setLogErrorsToConsole(value = true) {
        options.logErrorsToConsole = value;
    },
    /**
     * @param {boolean} value - Show error to client?
     * */
    setShowErrorToClient(value = true) {
        options.showErrorToClient = value;
    },
    /**
     * @param {Request} req
     * @param {Response} res
     * @param {function} next
     */
    callback: (req, res, next) => {
        /**
         * @param {string} file
         * @param {Object?} variables
         */
        req.sendNode = (file, variables = {}) => {
            const json = module.exports.compile(require("fs").readFileSync(options.directory + file + ".html").toString(), variables);
            if (json.error) {
                if (options.showErrorToClient) {
                    res.send(`<code>${json.error}</code>`);
                } else {
                    onError.forEach(callable => callable(req, res, json.error));
                }
            } else {
                res.send(json.result);
            }
        };
        next();
    },
    /**
     * @param {string} result
     * @param {Object} variables
     * @returns {{error: null}|{result: string}}
     */
    compile(result, variables) {
        let reg;
        let error = null;
        let errorCode = null;
        while (!error && (reg = /render{.+}/.exec(result))) {
            const file = [...reg[0]].slice(7, reg[0].length - 1).join("");
            try {
                result = result.replaceAll(reg[0], require("fs").readFileSync(options.directory + file + ".html").toString());
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
            }
        }
        while (!error && (reg = /print{.+}/.exec(result))) {
            const code = [...reg[0]].slice(6, reg[0].length - 1).join("");
            const r = evalCode(code, variables);
            try {
                result = result.replace(`print{${code}}`, typeof r === "string" || typeof r === "number" ? r : JSON.stringify(r));
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
                errorCode = code;
            }
        }
        while (!error && (reg = /print_r{.+}/.exec(result))) {
            const code = [...reg[0]].slice(8, reg[0].length - 1).join("");
            try {
                result = result.replace(`print_r{${code}}`, evalCode(code, variables));
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
                errorCode = code;
            }
        }
        while (!error && (reg = /print_s{.+}/.exec(result))) {
            const code = [...reg[0]].slice(8, reg[0].length - 1).join("");
            try {
                result = result.replace(`print_s{${code}}`, evalCode(code, variables).toString().replaceAll("<", "&zwnj;<&zwnj;").replaceAll(">", "&zwnj;>&zwnj;"));
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
                errorCode = code;
            }
        }
        while (!error && (reg = /run{.+}/.exec(result))) {
            const code = [...reg[0]].slice(4, reg[0].length - 1).join("");
            result = result.replace(`run{${code}}`, "");
            try {
                evalCode(code, variables);
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
                errorCode = code;
            }
        }
        while (!error && (reg = /file{.+}/.exec(result))) {
            const file = [...reg[0]].slice(5, reg[0].length - 1).join("");
            try {
                result = result.replaceAll(reg[0], require("fs").readFileSync(file).toString());
            } catch (e) {
                if (options.crashEnabled) throw new Error(e);
                error = e;
            }
        }
        if(error && options.logErrorsToConsole) {
            if(errorCode) console.info("~~~~~\nCode: " + errorCode);
            console.error(error);
        }
        return error ? {error} : {result};
    }
};
module.exports.setDirectory("./");