const StateMachine = require('../js/state').StateMachine;

// helpers

function processState(stateMachine, states) {
  Array.from(states).forEach(s => stateMachine.transit(s));
}

function stateString(state) {
  return Array.isArray(state) ? Array.from(state).join('') : state;
}

// specs

describe('state', function () {

  beforeEach(function () {
    this.logs = []; // message stack
    this.transition = (to, from) => {
      [to, from] = [to, from].map(stateString);
      return { to, from, do: () => this.logs.push(`${to}-${from}`) };
    }
    this.spy = jasmine.createSpy('dummy');
  })

  describe('StateMachine', function () {

    it('execut registered tasks for each transition', function () {
      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          { from: 'A', to: 'B', do: this.spy }, // task to execute when change state A -> B
        ]
      });
      expect(this.spy.calls.count()).toBe(0);
      sm.transit('B'); // A -> B
      expect(this.spy.calls.count()).toBe(1);
      sm.transit('A'); // B -> A, no registered tasks
      expect(this.spy.calls.count()).toBe(1);
      sm.transit('B'); // A -> B
      expect(this.spy.calls.count()).toBe(2);
    })

    it('can be registered multi tasks for a transition', function () {
      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          { from: 'A', to: 'B', do: this.spy },
          { from: 'A', to: 'B', do: this.spy },
        ]
      });
      expect(this.spy.calls.count()).toBe(0);
      sm.transit('B'); // A -> B
      expect(this.spy.calls.count()).toBe(2);
    })

    it('execute registered tasks with each transition', function () {

      // prepare to stack trace
      const trace = (to, from) => () => this.logs.push(`${to}${from}`); // factory

      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          this.transition('A', 'A'),
          this.transition('A', 'B'),
          this.transition('A', 'C'),
          this.transition('*', 'B'),
          this.transition('*', 'C'),
        ]
      });

      processState(sm, 'ACACDDAC');
      expect(this.logs).toEqual(['A-A', 'A-C', '*-C', '*-C']);
    })

    describe('constructor params', function () {

      describe('transitions', function () {

        it('accept string or string array of states', function () {

          const sm = new StateMachine({
            initial: 'A',
            transitions: [
              { from: 'A', to: 'A',        do: () => this.logs.push('A-A') },
              { from: 'A', to: ['A', 'B'], do: () => this.logs.push('A-AB') },
            ]
          });
          sm.transit('A');
          expect(this.logs).toEqual(['A-A', 'A-AB']);
        })

        it('accept * to match any states', function () {

        })
      })
    })
  })
})
