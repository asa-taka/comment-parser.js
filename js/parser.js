"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const detector_1 = require("./detector");
const state_1 = require("./state");
class Parser {
    constructor(params) {
        this.params = params;
        const classes = Object.keys(params.classes).map((c) => {
            return { name: c, pattern: params.classes[c].pattern };
        });
        this.detector = new detector_1.LineClassDetector({
            classes,
            default: 'entry',
        });
    }
    parse(str) {
        const lines = str.split('\n');
        const entries = [];
        const orphans = [];
        let comments = [];
        const sm = new state_1.StateMachine({
            initial: 'clear',
            transitions: [
                { from: '*', to: 'comment', do: (e, m) => {
                        if (m.prev !== 'comment')
                            comments = [];
                        comments.push(e.value);
                    } },
                { from: '*', to: 'clear', do: e => comments = [] },
                { from: '*', to: ['entry', 'disabled'], do: (e, m) => {
                        entries.push({
                            value: e.value,
                            comments: { nearby: comments, inline: [] },
                            disabled: m.state === 'comment',
                            source: e,
                        });
                    } },
            ]
        });
        lines.forEach((line, i) => {
            const c = this.detector.detectClass(line);
            sm.transit(c, { value: line, line: i });
        });
        return { entries };
    }
}
exports.Parser = Parser;
(function (Parser) {
    function interpreteLineClassDefinition(v) {
        if (v instanceof RegExp)
            return { pattern: v };
        return v;
    }
    Parser.interpreteLineClassDefinition = interpreteLineClassDefinition;
    ;
})(Parser = exports.Parser || (exports.Parser = {}));
const defaultParser = new Parser({
    classes: {
        clear: { pattern: /^$/ },
        comment: { pattern: /^#[ \-]/ },
        disabled: { pattern: /^#/ },
    }
});
function parse(str) {
    return defaultParser.parse(str);
}
exports.parse = parse;
