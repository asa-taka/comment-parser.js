const StateMachine = require('../js/state').StateMachine;

describe('state', () => {

  describe('StateMachine', () => {

    it('execut registered tasks for each transition', () => {
      const spy = jasmine.createSpy('dummy');
      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          { from: 'A', to: 'B', do: spy }, // task to execute when change state A -> B
        ]
      });
      expect(spy.calls.count()).toBe(0);
      sm.transit('B'); // A -> B
      expect(spy.calls.count()).toBe(1);
      sm.transit('A'); // B -> A, no registered tasks
      expect(spy.calls.count()).toBe(1);
      sm.transit('B'); // A -> B
      expect(spy.calls.count()).toBe(2);
    })

    it('can be registered multi tasks for a transition', () => {
      const spy = jasmine.createSpy('dummy');
      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          { from: 'A', to: 'B', do: spy },
          { from: 'A', to: 'B', do: spy },
        ]
      });
      expect(spy.calls.count()).toBe(0);
      sm.transit('B'); // A -> B
      expect(spy.calls.count()).toBe(2);
    })

    it('execut registered tasks with each transition', () => {

      // prepare to stack trace
      const stack = [];
      const trace = (to, from) => () => stack.push(`${to}${from}`); // factory

      const sm = new StateMachine({
        initial: 'A',
        transitions: [
          { from: 'A', to: 'A', do: trace('A', 'A') },
          { from: 'A', to: 'B', do: trace('A', 'B') },
          { from: 'A', to: 'C', do: trace('A', 'C') },
          { from: '*', to: 'B', do: trace('*', 'B') },
          { from: '*', to: 'C', do: trace('*', 'C') },
        ]
      });

      Array.from('ACACDDAC').forEach(s => sm.transit(s));
      expect(stack).toEqual(['AA', 'AC', '*C', 'AC', '*C', 'AC', '*C']);
    })

    describe('constructor params', () => {

      describe('transitions', () => {

        it('accept string or string array of states', () => {

          // prepare to stack trace
          const stack = [];
          const sm = new StateMachine({
            initial: 'A',
            transitions: [
              { from: 'A', to: 'A', do: () => stack.push('A-A') },
              { from: 'A', to: ['A', 'B'], do: () => stack.push('A-AB') },
            ]
          });

          sm.transit('A');
          expect(stack).toEqual(['A-A', 'A-AB']);
        })

        it('accept * to match any states', () => {

        })
      })
    })
  })
})
