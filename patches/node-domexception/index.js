const DOMException = globalThis.DOMException || global.DOMException || (() => {
    function DOMException(message, name) {
        Error.call(this, message);
        this.message = message || "";
        this.name = name || "Error";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    DOMException.prototype = Object.create(Error.prototype);
    DOMException.prototype.constructor = DOMException;
    return DOMException;
})();

module.exports = DOMException;
