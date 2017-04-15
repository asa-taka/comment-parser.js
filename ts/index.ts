export type LineClassName = 'header' | 'comment' | 'disabled' | 'entry'

export interface LineClassDefinition {
  pattern: RegExp;
  clear: RegExp;
}

// export interface MultiLineClassDefinition extends LineClassDefinition {
//   isMulti: booelan;
//   begin: RegExp;
//   end: RegExp;
// }

// export interface HeaderDefinition extends LineClassDefinition {
//   level: number;
// }
