"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StateMachine {
    constructor(params) {
        this.params = params;
        this.state = params.initial;
    }
    match(state, exp) {
        if (Array.isArray(exp)) {
            return exp.includes(state);
        }
        return exp === state || exp === '*';
    }
    transit(state, data) {
        const prev = this.state;
        this.params.transitions.forEach(t => {
            if (!this.match(state, t.to) || !this.match(prev, t.from))
                return;
            t.do(data, { state, prev });
        });
        this.state = state;
    }
    clear() {
        this.state = undefined;
    }
}
exports.StateMachine = StateMachine;
