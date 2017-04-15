"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LineClassDetector {
    constructor(params) {
        this.params = params;
    }
    detectClass(line) {
        for (let def of this.params.classes) {
            if (def.pattern.test(line))
                return def.name;
        }
        return this.params.default;
    }
}
exports.LineClassDetector = LineClassDetector;
