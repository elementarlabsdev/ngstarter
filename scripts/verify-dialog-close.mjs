import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  Call, ImplicitReceiver, parseTemplate, PropertyRead, SafeCall, SafePropertyRead,
  ThisReceiver, TmplAstRecursiveVisitor,
} from '@angular/compiler';
import ts from 'typescript';

const { values: { base } } = parseArgs({ options: { base: { type: 'string', default: 'HEAD' } } });
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' });
const revision = git('rev-parse', '--verify', '--end-of-options', `${base}^{commit}`).trim();
const changed = new Set([
  ...git('diff', '--name-only', '--diff-filter=ACMRT', '-z', revision, '--', 'src', 'projects').split('\0'),
  ...git('ls-files', '--others', '--exclude-standard', '-z', '--', 'src', 'projects').split('\0'),
].filter(Boolean).map(file => path.resolve(file)));

const isSource = file => file.endsWith('.ts') && !/\.(?:d|spec|test)\.ts$/.test(file);
const sourcePaths = new Set([...changed].filter(isSource));
for (const dir of new Set([...changed].filter(file => file.endsWith('.html')).map(file => path.dirname(file)))) {
  // NgStarter keeps external templates alongside their component.
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    if (file.isFile() && isSource(file.name)) sourcePaths.add(path.join(dir, file.name));
  }
}
if (!sourcePaths.size) {
  console.log('DialogClose verification passed. No Angular source or template changes.');
  process.exit(0);
}

const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram([...sourcePaths], options);
const checker = program.getTypeChecker();
const dialogRefFile = path.resolve('projects/components/dialog/src/dialog-ref.ts');
const failures = new Set();
const dialogRegions = new Set([
  'ngs-dialog-title', 'ngsDialogTitle',
  'ngs-dialog-content', 'ngsDialogContent',
  'ngs-dialog-actions', 'ngsDialogActions',
]);

function isDialogRefClose(symbol) {
  return symbol?.name === 'close' && symbol.declarations?.some(declaration =>
    path.resolve(declaration.getSourceFile().fileName) === dialogRefFile);
}

function containsAwait(node) {
  return ts.isAwaitExpression(node) || ts.forEachChild(node, child => containsAwait(child) || undefined);
}

function closesOnly(body) {
  let closeCalls = 0;

  function visit(node) {
    if (ts.isBlock(node)) return node.statements.every(visit);
    if (ts.isIfStatement(node)) return visit(node.thenStatement) && (!node.elseStatement || visit(node.elseStatement));
    if (ts.isReturnStatement(node) && !node.expression) return true;
    const call = ts.isReturnStatement(node) || ts.isExpressionStatement(node) ? node.expression : node;
    if (!call || !ts.isCallExpression(call) || !ts.isPropertyAccessExpression(call.expression) ||
        !isDialogRefClose(checker.getSymbolAtLocation(call.expression.name))) return false;
    closeCalls++;
    return true;
  }

  return !!body && visit(body) && closeCalls === 1 && !containsAwait(body);
}

const isComponentReceiver = receiver => receiver instanceof ImplicitReceiver || receiver instanceof ThisReceiver;

function templateMember(receiver, name, componentType, component) {
  if (isComponentReceiver(receiver)) return checker.getPropertyOfType(componentType, name);
  if (!(receiver instanceof PropertyRead || receiver instanceof SafePropertyRead)) return undefined;
  const parent = templateMember(receiver.receiver, receiver.name, componentType, component);
  if (!parent) return undefined;
  const type = checker.getTypeOfSymbolAtLocation(parent, component);
  return checker.getPropertyOfType(checker.getNonNullableType(type), name);
}

function templateClosesOnly(handler, componentType, component) {
  const call = handler.ast;
  if (!(call instanceof Call || call instanceof SafeCall)) return false;
  const member = call.receiver;
  if (!(member instanceof PropertyRead || member instanceof SafePropertyRead)) return false;
  const symbol = templateMember(member.receiver, member.name, componentType, component);
  if (isDialogRefClose(symbol)) return true;
  if (!isComponentReceiver(member.receiver)) return false;
  return symbol?.declarations?.some(declaration => {
    if (ts.isMethodDeclaration(declaration)) return closesOnly(declaration.body);
    if (!ts.isPropertyDeclaration(declaration)) return false;
    const fn = declaration.initializer;
    return fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && closesOnly(fn.body);
  });
}

function checkTemplate(template, file, lineOffset, component) {
  const componentType = checker.getTypeAtLocation(component);

  class Visitor extends TmplAstRecursiveVisitor {
    inDialog = false;

    visitElement(node) {
      const wasInDialog = this.inDialog;
      this.inDialog ||= dialogRegions.has(node.name) ||
        [...node.attributes, ...node.inputs].some(attribute => dialogRegions.has(attribute.name));

      if (this.inDialog && node.name === 'button') {
        for (const event of node.outputs) {
          if (event.name !== 'click' || !templateClosesOnly(event.handler, componentType, component)) continue;
          const { line, col } = event.sourceSpan.start;
          failures.add(`${path.relative(process.cwd(), file)}:${line + lineOffset + 1}:${col + 1} ` +
            'Use DialogClose (ngs-dialog-close or ngsDialogClose) for a button that only closes the dialog.');
        }
      }

      super.visitElement(node);
      this.inDialog = wasInDialog;
    }
  }

  const visitor = new Visitor();
  for (const node of parseTemplate(template, file).nodes) node.visit(visitor);
}

for (const file of sourcePaths) {
  const source = program.getSourceFile(file);
  if (!source) continue;
  for (const component of source.statements.filter(ts.isClassDeclaration)) {
    for (const decorator of ts.getDecorators(component) ?? []) {
      const call = decorator.expression;
      if (!ts.isCallExpression(call) || call.expression.getText(source) !== 'Component') continue;
      const [metadata] = call.arguments;
      if (!metadata || !ts.isObjectLiteralExpression(metadata)) continue;
      for (const property of metadata.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteralLike(property.initializer)) continue;
        const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
        const { text } = property.initializer;
        if (name === 'template' && changed.has(file)) {
          const { line } = source.getLineAndCharacterOfPosition(property.initializer.getStart(source));
          checkTemplate(text, file, line, component);
        }
        if (name === 'templateUrl') {
          const template = path.resolve(path.dirname(file), text);
          if ((changed.has(file) || changed.has(template)) && existsSync(template)) {
            checkTemplate(readFileSync(template, 'utf8'), template, 0, component);
          }
        }
      }
    }
  }
}

if (failures.size) {
  console.error([...failures].join('\n'));
  process.exitCode = 1;
} else {
  console.log('DialogClose verification passed.');
}
