import { LineClassDetector } from './detector';
import { StateMachine } from './state';

export class Parser {

  private detector: LineClassDetector<Parser.LineClass>;
  private sm: StateMachine<Parser.LineClass, Parser.Source>;

  constructor(private params: Parser.Params) {

    const classes = Object.keys(params.classes).map((c: Parser.LineClass) => {
      return { name: c, pattern: params.classes[c].pattern };
    });

    this.detector = new LineClassDetector<Parser.LineClass>({
      classes,
      default: 'entry',
    });
  }

  parse(str: string) {
    const lines = str.split('\n');

    const entries: Parser.ParsedEntries[] = [];
    const orphans: string[] = [];

    let comments: string[] = [];

    const sm = new StateMachine<Parser.LineClass, Parser.Source>({
      initial: 'clear',
      transitions: [
        { from: '*', to: 'comment', do: (e, m) => {
          if (m.prev !== 'comment') comments = [];
          comments.push(e.value);
        }},
        { from: '*', to: 'clear', do: e => comments = [] },
        { from: '*', to: ['entry', 'disabled'], do: (e, m) => {
          entries.push({
            value: e.value,
            comments: { nearby: comments, inline: [] },
            disabled: m.state === 'comment',
            source: e,
          })
        }},
      ]
    });

    lines.forEach((line, i) => {
      const c = this.detector.detectClass(line);
      sm.transit(c, { value: line, line: i });
    })

    return { entries }
  }
}

export namespace Parser {

  export type LineClass = 'comment' | 'clear' | 'disabled' | 'entry';

  export interface Params {
    classes: { [C in LineClass]?: LineClassDefinition };
  }

  export interface LineClassDefinition {
    pattern: RegExp;
  }

  export type LineClassDefinitionInterpretable = LineClassDefinition | RegExp
  export function interpreteLineClassDefinition(v: LineClassDefinitionInterpretable): LineClassDefinition {
    if (v instanceof RegExp) return { pattern: v };
    return v;
  };

  export interface ParseResult {
    entries: ParsedEntries;
    orphans: string[];
  }

  export interface ParsedEntries {
    value: string;
    comments: {
      nearby: string[];
      inline: string[];
    },
    disabled: boolean;
    source: Source;
  }

  export interface Source {
    line: number;
    value: string;
  }
}


const defaultParser = new Parser({
  classes: {
    clear: { pattern: /^$/ },
    comment: { pattern: /^#[ \-]/ },
    disabled: { pattern: /^#/ },
  }
})

export function parse(str: string) {
  return defaultParser.parse(str);
}
