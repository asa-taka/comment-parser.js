export class LineClassDetector<C> {

  constructor(private params: LineClassDetector.Params<C>) {}

  detectClass(line: string): C {
    for (let def of this.params.classes) {
      if (def.pattern.test(line)) return def.name;
    }
    return this.params.default;
  }
}

export namespace LineClassDetector {

  export interface Params<C> {
    classes: ClassDefinition<C>[];
    default?: C;
  }

  export interface ClassDefinition<C> {
    name: C;
    pattern: RegExp;
  }
}
