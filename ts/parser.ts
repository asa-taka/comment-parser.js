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

  parse(str: string): Parser.ParseResult {
    const lines = str.split('\n');

    const entries: Parser.ParsedEntry[] = [];
    const orphans: string[] = [];

    let comments: string[] = [];

    const sm = new StateMachine<Parser.LineClass, Parser.Source>({
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
        }},
      ]
    });

    lines.forEach((line, i) => {
      const c = this.detector.detectClass(line);
      sm.transit(c, { value: line, line: i+1 });
    })

    return { entries, orphans }
  }

  private separateInlineComment(str: string) {
    const [ value, ...comments ] = str.split('#');
    return { value, comments };
  }

  private trimPattern(str: string, c: Parser.LineClass) {
    return str.replace(this.params.classes[c].pattern, '');
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
    entries: ParsedEntry[];
    orphans: string[];
  }

  export interface ParsedEntry {
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
