import {
  FormBuilderCalculationContext,
  FormBuilderCalculationEngine,
  FormBuilderField
} from './types';

type FormulaTokenType =
  | 'number'
  | 'string'
  | 'identifier'
  | 'operator'
  | 'leftParen'
  | 'rightParen'
  | 'comma'
  | 'eof';

interface FormulaToken {
  type: FormulaTokenType;
  value: string;
  position: number;
}

const FORMULA_FUNCTIONS = new Set([
  'ABS',
  'AVERAGE',
  'AVG',
  'CEILING',
  'CEIL',
  'CONCAT',
  'CONCATENATE',
  'COUNT',
  'COUNTA',
  'FLOOR',
  'IF',
  'MAX',
  'MIN',
  'MOD',
  'POWER',
  'ROUND',
  'SQRT',
  'SUM'
]);

const FORMULA_CONSTANTS = new Set(['FALSE', 'NULL', 'PI', 'TRUE']);

export const DEFAULT_FORM_BUILDER_CALCULATION_ENGINE: FormBuilderCalculationEngine = {
  evaluate(expression, context) {
    try {
      const tokens = tokenizeFormula(expression);
      const parser = new FormulaParser(tokens, context);
      const value = parser.parse();

      return { value };
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Invalid expression.'
      };
    }
  },
  dependencies(expression, fields) {
    const fieldNames = new Set(fields.map(field => field.name).filter(Boolean));

    try {
      const tokens = tokenizeFormula(expression);
      const dependencies = new Set<string>();

      tokens.forEach((token, index) => {
        if (token.type !== 'identifier') {
          return;
        }

        const name = token.value;
        const normalized = name.toUpperCase();
        const nextToken = tokens[index + 1];

        if (FORMULA_CONSTANTS.has(normalized) || (FORMULA_FUNCTIONS.has(normalized) && nextToken?.type === 'leftParen')) {
          return;
        }

        const rootName = name.split('.')[0];

        if (fieldNames.has(name)) {
          dependencies.add(name);
        } else if (fieldNames.has(rootName)) {
          dependencies.add(rootName);
        }
      });

      return Array.from(dependencies);
    } catch {
      return [];
    }
  }
};

function tokenizeFormula(expression: string): FormulaToken[] {
  const source = expression.trim();
  const tokens: FormulaToken[] = [];
  let position = 0;

  while (position < source.length) {
    const char = source[position];

    if (/\s/.test(char)) {
      position += 1;
      continue;
    }

    if (isDigit(char) || (char === '.' && isDigit(source[position + 1]))) {
      const start = position;
      position += 1;

      while (position < source.length && /[\d.]/.test(source[position])) {
        position += 1;
      }

      tokens.push({ type: 'number', value: source.slice(start, position), position: start });
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      const start = position;
      let value = '';
      position += 1;

      while (position < source.length && source[position] !== quote) {
        if (source[position] === '\\' && position + 1 < source.length) {
          value += source[position + 1];
          position += 2;
          continue;
        }

        value += source[position];
        position += 1;
      }

      if (source[position] !== quote) {
        throw new Error('Unclosed string literal.');
      }

      position += 1;
      tokens.push({ type: 'string', value, position: start });
      continue;
    }

    if (isIdentifierStart(char)) {
      const start = position;
      position += 1;

      while (position < source.length && isIdentifierPart(source[position])) {
        position += 1;
      }

      tokens.push({ type: 'identifier', value: source.slice(start, position), position: start });
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'leftParen', value: char, position });
      position += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rightParen', value: char, position });
      position += 1;
      continue;
    }

    if (char === ',' || char === ';') {
      tokens.push({ type: 'comma', value: char, position });
      position += 1;
      continue;
    }

    const twoCharOperator = source.slice(position, position + 2);

    if (['>=', '<=', '<>'].includes(twoCharOperator)) {
      tokens.push({ type: 'operator', value: twoCharOperator, position });
      position += 2;
      continue;
    }

    if (['+', '-', '*', '/', '^', '&', '>', '<', '='].includes(char)) {
      tokens.push({ type: 'operator', value: char, position });
      position += 1;
      continue;
    }

    throw new Error(`Unexpected character "${char}".`);
  }

  tokens.push({ type: 'eof', value: '', position: source.length });
  return tokens;
}

class FormulaParser {
  private position = 0;

  constructor(
    private readonly tokens: FormulaToken[],
    private readonly context: FormBuilderCalculationContext
  ) {}

  parse(): any {
    const value = this.parseComparison();
    this.expect('eof');
    return value;
  }

  private parseComparison(): any {
    let value = this.parseConcatenation();

    while (this.matchOperator('>', '<', '>=', '<=', '=', '<>')) {
      const operator = this.previous().value;
      const right = this.parseConcatenation();

      value = compareValues(value, right, operator);
    }

    return value;
  }

  private parseConcatenation(): any {
    let value = this.parseAdditive();

    while (this.matchOperator('&')) {
      value = `${value ?? ''}${this.parseAdditive() ?? ''}`;
    }

    return value;
  }

  private parseAdditive(): any {
    let value = this.parseMultiplicative();

    while (this.matchOperator('+', '-')) {
      const operator = this.previous().value;
      const right = this.parseMultiplicative();

      value = operator === '+'
        ? toNumber(value) + toNumber(right)
        : toNumber(value) - toNumber(right);
    }

    return value;
  }

  private parseMultiplicative(): any {
    let value = this.parsePower();

    while (this.matchOperator('*', '/')) {
      const operator = this.previous().value;
      const right = this.parsePower();

      value = operator === '*'
        ? toNumber(value) * toNumber(right)
        : toNumber(value) / toNumber(right);
    }

    return value;
  }

  private parsePower(): any {
    let value = this.parseUnary();

    while (this.matchOperator('^')) {
      value = Math.pow(toNumber(value), toNumber(this.parseUnary()));
    }

    return value;
  }

  private parseUnary(): any {
    if (this.matchOperator('+')) {
      return toNumber(this.parseUnary());
    }

    if (this.matchOperator('-')) {
      return -toNumber(this.parseUnary());
    }

    return this.parsePrimary();
  }

  private parsePrimary(): any {
    if (this.match('number')) {
      const value = Number(this.previous().value);

      if (!Number.isFinite(value)) {
        throw new Error('Invalid number.');
      }

      return value;
    }

    if (this.match('string')) {
      return this.previous().value;
    }

    if (this.match('identifier')) {
      const identifier = this.previous().value;

      if (this.match('leftParen')) {
        const args = this.parseArguments();
        return callFormulaFunction(identifier, args);
      }

      return this.resolveIdentifier(identifier);
    }

    if (this.match('leftParen')) {
      const value = this.parseComparison();
      this.expect('rightParen');
      return value;
    }

    throw new Error('Expected a value.');
  }

  private parseArguments(): any[] {
    const args: any[] = [];

    if (this.match('rightParen')) {
      return args;
    }

    do {
      args.push(this.parseComparison());
    } while (this.match('comma'));

    this.expect('rightParen');
    return args;
  }

  private resolveIdentifier(identifier: string): any {
    const normalized = identifier.toUpperCase();

    if (normalized === 'TRUE') {
      return true;
    }

    if (normalized === 'FALSE') {
      return false;
    }

    if (normalized === 'NULL') {
      return null;
    }

    if (normalized === 'PI') {
      return Math.PI;
    }

    const value = readPathValue(this.context.values, identifier);

    return value === undefined ? null : value;
  }

  private match(type: FormulaTokenType): boolean {
    if (this.current().type !== type) {
      return false;
    }

    this.position += 1;
    return true;
  }

  private matchOperator(...operators: string[]): boolean {
    const token = this.current();

    if (token.type !== 'operator' || !operators.includes(token.value)) {
      return false;
    }

    this.position += 1;
    return true;
  }

  private expect(type: FormulaTokenType): FormulaToken {
    const token = this.current();

    if (token.type !== type) {
      throw new Error(`Expected ${type}.`);
    }

    this.position += 1;
    return token;
  }

  private current(): FormulaToken {
    return this.tokens[this.position];
  }

  private previous(): FormulaToken {
    return this.tokens[this.position - 1];
  }
}

function callFormulaFunction(name: string, args: any[]): any {
  switch (name.toUpperCase()) {
    case 'ABS':
      return Math.abs(toNumber(args[0]));
    case 'AVERAGE':
    case 'AVG':
      return average(args);
    case 'CEILING':
    case 'CEIL':
      return Math.ceil(toNumber(args[0]));
    case 'CONCAT':
    case 'CONCATENATE':
      return flattenArgs(args).map(value => value ?? '').join('');
    case 'COUNT':
      return flattenArgs(args).filter(value => Number.isFinite(Number(value))).length;
    case 'COUNTA':
      return flattenArgs(args).filter(value => value !== null && value !== undefined && value !== '').length;
    case 'FLOOR':
      return Math.floor(toNumber(args[0]));
    case 'IF':
      return isTruthy(args[0]) ? args[1] : args[2];
    case 'MAX':
      return max(args);
    case 'MIN':
      return min(args);
    case 'MOD':
      return toNumber(args[0]) % toNumber(args[1]);
    case 'POWER':
      return Math.pow(toNumber(args[0]), toNumber(args[1]));
    case 'ROUND':
      return round(toNumber(args[0]), toNumber(args[1] ?? 0));
    case 'SQRT':
      return Math.sqrt(toNumber(args[0]));
    case 'SUM':
      return flattenArgs(args).reduce((total, value) => total + toNumber(value), 0);
    default:
      throw new Error(`Unknown function "${name}".`);
  }
}

function compareValues(left: any, right: any, operator: string): boolean {
  const leftComparable = comparableValue(left);
  const rightComparable = comparableValue(right);

  switch (operator) {
    case '>':
      return leftComparable > rightComparable;
    case '<':
      return leftComparable < rightComparable;
    case '>=':
      return leftComparable >= rightComparable;
    case '<=':
      return leftComparable <= rightComparable;
    case '=':
      return leftComparable === rightComparable;
    case '<>':
      return leftComparable !== rightComparable;
    default:
      return false;
  }
}

function comparableValue(value: any): any {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : String(value);
}

function average(args: any[]): number {
  const values = flattenArgs(args).map(toNumber);

  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function max(args: any[]): number {
  const values = flattenArgs(args).map(toNumber);

  return values.length ? Math.max(...values) : 0;
}

function min(args: any[]): number {
  const values = flattenArgs(args).map(toNumber);

  return values.length ? Math.min(...values) : 0;
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;

  return Math.round(value * factor) / factor;
}

function toNumber(value: any): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : 0;
}

function isTruthy(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return !!value;
}

function flattenArgs(args: any[]): any[] {
  return args.flatMap(arg => Array.isArray(arg) ? flattenArgs(arg) : [arg]);
}

function readPathValue(source: Record<string, any>, path: string): any {
  if (Object.prototype.hasOwnProperty.call(source, path)) {
    return source[path];
  }

  return readPathSegments(source, path.split('.'));
}

function readPathSegments(value: any, segments: string[]): any {
  if (!segments.length) {
    return value;
  }

  if (Array.isArray(value)) {
    const [key, ...rest] = segments;
    const index = Number(key);

    if (Number.isInteger(index) && index >= 0) {
      return readPathSegments(value[index], rest);
    }

    return value
      .map(item => readPathSegments(item, segments))
      .filter(item => item !== undefined);
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  const [key, ...rest] = segments;

  if (!Object.prototype.hasOwnProperty.call(Object(value), key)) {
    return undefined;
  }

  return readPathSegments(value[key], rest);
}

function isDigit(value: string | undefined): boolean {
  return !!value && /\d/.test(value);
}

function isIdentifierStart(value: string): boolean {
  return /[A-Za-z_$]/.test(value);
}

function isIdentifierPart(value: string): boolean {
  return /[A-Za-z0-9_$.]/.test(value);
}
