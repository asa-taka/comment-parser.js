export class StateMachine<S extends string, T> {

  state: S;

  constructor(private params: StateMachine.Params<S,T>) {
    this.state = params.initial;
  }

  // @param{state} an actual state
  // @param{exp} expression of state(state, state[], or '*');
  private match(state: S, exp: StateMachine.StateExpression<S>) {
    if (Array.isArray(exp)) {
      return exp.includes(state);
    }
    return exp === state || exp === '*';
  }

  transit(state: S, data?: T) {
    const prev = this.state;
    this.params.transitions.forEach(t => {
      if (!this.match(state, t.to) || !this.match(prev, t.from)) return;
      t.do(data, { state, prev });
    });
    this.state = state;
  }

  clear() {
    this.state = undefined;
  }
}

export namespace StateMachine {

   // `S` means user defined States
  export type ReservedState = '*'
  export type State<S> = S | ReservedState;
  export type StateExpression<S> = State<S> | State<S>[]

  export interface Params<S,T> {
    initial: S;
    transitions: Transition<S,T>[];
  }

  export interface Transition<S,T> {
    to: StateExpression<S>;
    from: StateExpression<S>;
    do: { (data: T, meta: Meta<S>) };
  }

  export interface Meta<S> {
    state: S;
    prev: S;
  }
}
