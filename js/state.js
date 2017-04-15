"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StateMachine {
    constructor(params) {
        this.params = params;
        this.state = params.initial;
    }
    // @param{state} an actual state
    // @param{exp} expression of state(state, state[], or '*');
    match(state, exp) {
        if (Array.isArray(exp)) {
            return exp.includes(state);
        }
        return exp === state || exp === '*';
    }
    transit(state, data) {
        const tasks = this.params.transitions.filter(t => {
            return this.match(state, t.to) && this.match(this.state, t.from);
        });
        tasks.forEach(t => t.do(data, { state, prev: this.state }));
        this.state = state;
    }
    clear() {
        this.state = undefined;
    }
}
exports.StateMachine = StateMachine;
