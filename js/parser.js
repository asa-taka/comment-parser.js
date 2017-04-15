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
                { from: ['clear', 'disabled', 'entry'], to: 'comment', do: () => comments = [] },
                { from: '*', to: 'comment', do: src => comments.push(this.trimPattern(src.value, 'comment')) },
                { from: '*', to: 'clear', do: src => comments = [] },
                { from: '*', to: ['entry', 'disabled'], do: (src, m) => {
                        const disabled = m.state === 'disabled';
                        const value = disabled ? this.trimPattern(src.value, 'disabled') : src.value;
                        const inline = this.separateInlineComment(value);
                        entries.push({
                            value: inline.value.trim(),
                            comments: { nearby: comments, inline: inline.comments.map(c => c.trim()) },
                            disabled,
                            source: src,
                        });
                    } },
            ]
        });
        lines.forEach((line, i) => {
            const c = this.detector.detectClass(line);
            sm.transit(c, { value: line, line: i + 1 });
        });
        return { entries, orphans };
    }
    separateInlineComment(str) {
        const [value, ...comments] = str.split('#');
        return { value, comments };
    }
    trimPattern(str, c) {
        return str.replace(this.params.classes[c].pattern, '');
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
