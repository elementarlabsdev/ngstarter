import { Component, ChangeDetectionStrategy, input, OnChanges, SimpleChanges, signal, computed, inject, booleanAttribute } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { codeToHtml, ShikiTransformer } from 'shiki';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

const removeDiffPrefix = (node: any) => {
  if (!node.children || node.children.length === 0) return;

  const firstChild = node.children[0];
  if (firstChild.type === 'element' && firstChild.children && firstChild.children.length > 0) {
    const textNode = firstChild.children[0];
    if (textNode.type === 'text' && (textNode.value.startsWith('+') || textNode.value.startsWith('-'))) {
      textNode.value = textNode.value.slice(1);
      if (textNode.value === '' && firstChild.children.length === 1) {
        node.children.shift();
      }
    }
  } else if (firstChild.type === 'text' && (firstChild.value.startsWith('+') || firstChild.value.startsWith('-'))) {
    firstChild.value = firstChild.value.slice(1);
    if (firstChild.value === '') {
      node.children.shift();
    }
  }
};

const diffTransformer: ShikiTransformer = {
  line(node, line) {
    if (this.options.lang === 'diff' || (this.options as any).diff) {
      const lineTokens = this.tokens[line - 1];
      const text = lineTokens.map(token => token.content).join('');
      if (text.startsWith('+')) {
        this.addClassToHast(node, 'diff add');
        removeDiffPrefix(node);
      } else if (text.startsWith('-')) {
        this.addClassToHast(node, 'diff remove');
        removeDiffPrefix(node);
      }
    }
  }
};

@Component({
  selector: 'ngs-code-highlighter',
  standalone: true,
  imports: [Button, Icon],
  exportAs: 'ngsCodeHighlighter',
  templateUrl: './code-highlighter.html',
  styleUrl: './code-highlighter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ngs-code-highlighter not-prose',
    '[class.appearance-bordered]': 'appearance() === "bordered"',
    '[class.appearance-none]': 'appearance() === "none"',
  }
})
export class CodeHighlighter implements OnChanges {
  private sanitizer = inject(DomSanitizer);

  code = input.required<string>();
  language = input<string>('none');
  theme = input<string>('github-light');
  title = input<string | null>(null);
  appearance = input<'none' | 'bordered'>('bordered');
  diff = input<boolean>(false);
  highlightLines = input<number[] | number[][]>([]);
  showLanguage = input(false, { transform: booleanAttribute });
  showCopyButton = input(false, { transform: booleanAttribute });

  readonly content = signal<SafeHtml | null>(null);
  readonly isLoading = signal<boolean>(false);

  readonly displayedLanguage = computed(() => {
    const lang = this.language();
    if (!lang || lang === 'none') return '';

    const langMap: Record<string, string> = {
      '1c': '1C',
      'abap': 'ABAP',
      'actionscript-3': 'ActionScript 3',
      'ada': 'Ada',
      'apache': 'Apache',
      'apex': 'Apex',
      'apl': 'APL',
      'applescript': 'AppleScript',
      'ara': 'Ara',
      'asm': 'Assembly',
      'astro': 'Astro',
      'awk': 'AWK',
      'ballerina': 'Ballerina',
      'bash': 'Bash',
      'sh': 'Bash',
      'batch': 'Batch',
      'berry': 'Berry',
      'bibtex': 'BibTeX',
      'bicep': 'Bicep',
      'blade': 'Blade',
      'c': 'C',
      'cadence': 'Cadence',
      'clarity': 'Clarity',
      'clojure': 'Clojure',
      'clj': 'Clojure',
      'cmake': 'CMake',
      'cobol': 'COBOL',
      'codeql': 'CodeQL',
      'coffee': 'CoffeeScript',
      'cpp': 'C++',
      'csharp': 'C#',
      'cs': 'C#',
      'css': 'CSS',
      'cue': 'CUE',
      'cypher': 'Cypher',
      'd': 'D',
      'dart': 'Dart',
      'dax': 'DAX',
      'diff': 'Diff',
      'docker': 'Docker',
      'dockerfile': 'Dockerfile',
      'dream-maker': 'Dream Maker',
      'elixir': 'Elixir',
      'elm': 'Elm',
      'erb': 'ERB',
      'erlang': 'Erlang',
      'fish': 'Fish',
      'fsharp': 'F#',
      'fs': 'F#',
      'gdresource': 'GDResource',
      'gdscript': 'GDScript',
      'gdshader': 'GDShader',
      'gherkin': 'Gherkin',
      'git-commit': 'Git Commit',
      'git-rebase': 'Git Rebase',
      'glimmer-js': 'Glimmer JS',
      'gljs': 'Glimmer JS',
      'glsl': 'GLSL',
      'gnuplot': 'Gnuplot',
      'go': 'Go',
      'graphql': 'GraphQL',
      'groovy': 'Groovy',
      'hack': 'Hack',
      'haml': 'Haml',
      'handlebars': 'Handlebars',
      'hbs': 'Handlebars',
      'haskell': 'Haskell',
      'hs': 'Haskell',
      'hcl': 'HCL',
      'hjson': 'Hjson',
      'hlsl': 'HLSL',
      'html': 'HTML',
      'http': 'HTTP',
      'imba': 'Imba',
      'ini': 'INI',
      'java': 'Java',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'jinja-html': 'Jinja HTML',
      'jjson': 'JJSON',
      'json': 'JSON',
      'json5': 'JSON5',
      'jsonc': 'JSONC',
      'jsonnet': 'Jsonnet',
      'jssm': 'JSSM',
      'jsx': 'JSX',
      'julia': 'Julia',
      'kotlin': 'Kotlin',
      'kt': 'Kotlin',
      'kts': 'Kotlin',
      'kusto': 'Kusto',
      'latex': 'LaTeX',
      'lat': 'LaTeX',
      'tex': 'LaTeX',
      'lean': 'Lean',
      'less': 'Less',
      'liquid': 'Liquid',
      'lisp': 'Lisp',
      'logo': 'Logo',
      'lua': 'Lua',
      'make': 'Make',
      'makefile': 'Makefile',
      'markdown': 'Markdown',
      'md': 'Markdown',
      'marko': 'Marko',
      'matlab': 'MATLAB',
      'mdx': 'MDX',
      'mermaid': 'Mermaid',
      'mipsasm': 'MIPS Assembly',
      'mips': 'MIPS Assembly',
      'mojolicious': 'Mojolicious',
      'move': 'Move',
      'narrat': 'Narrat',
      'nextflow': 'Nextflow',
      'nginx': 'Nginx',
      'nim': 'Nim',
      'nix': 'Nix',
      'objective-c': 'Objective-C',
      'objc': 'Objective-C',
      'objective-cpp': 'Objective-C++',
      'ocaml': 'OCaml',
      'pascal': 'Pascal',
      'perl': 'Perl',
      'pl': 'Perl',
      'php': 'PHP',
      'plsql': 'PL/SQL',
      'postcss': 'PostCSS',
      'powerquery': 'PowerQuery',
      'powershell': 'PowerShell',
      'ps1': 'PowerShell',
      'prisma': 'Prisma',
      'prolog': 'Prolog',
      'proto': 'Protocol Buffers',
      'pug': 'Pug',
      'jade': 'Pug',
      'puppet': 'Puppet',
      'purescript': 'PureScript',
      'python': 'Python',
      'py': 'Python',
      'r': 'R',
      'raku': 'Raku',
      'razor': 'Razor',
      'reg': 'Registry',
      'rel': 'Rel',
      'riscv': 'RISC-V',
      'rst': 'reStructuredText',
      'ruby': 'Ruby',
      'rb': 'Ruby',
      'rust': 'Rust',
      'rs': 'Rust',
      'sas': 'SAS',
      'sass': 'Sass',
      'scala': 'Scala',
      'scheme': 'Scheme',
      'scss': 'SCSS',
      'shaderlab': 'ShaderLab',
      'shader': 'ShaderLab',
      'shell': 'Shell',
      'shellscript': 'Shell',
      'smalltalk': 'Smalltalk',
      'solidity': 'Solidity',
      'sparql': 'SPARQL',
      'sql': 'SQL',
      'ssh-config': 'SSH Config',
      'stata': 'Stata',
      'stylus': 'Stylus',
      'styl': 'Stylus',
      'svelte': 'Svelte',
      'swift': 'Swift',
      'system-verilog': 'SystemVerilog',
      'tasl': 'Tasl',
      'tcl': 'Tcl',
      'terraform': 'Terraform',
      'tf': 'Terraform',
      'toml': 'TOML',
      'tsx': 'TSX',
      'turtle': 'Turtle',
      'twig': 'Twig',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'v': 'V',
      'vb': 'Visual Basic',
      'verilog': 'Verilog',
      'vhdl': 'VHDL',
      'viml': 'VimL',
      'vim': 'VimL',
      'vue': 'Vue',
      'vyper': 'Vyper',
      'wasm': 'WebAssembly',
      'wenyan': 'Wenyan',
      'wgsl': 'WGSL',
      'wolfram': 'Wolfram',
      'xml': 'XML',
      'xsl': 'XSL',
      'yaml': 'YAML',
      'yml': 'YAML',
      'zenscript': 'ZenScript',
      'zig': 'Zig',
      'zsh': 'Zsh',
    };

    return langMap[lang.toLowerCase()] || lang;
  });

  private getHighlightTransformer(): ShikiTransformer {
    const highlights = this.highlightLines();
    if (!highlights || (Array.isArray(highlights) && highlights.length === 0)) {
      return {};
    }

    const isHighlighted = (line: number): boolean => {
      if (Array.isArray(highlights[0])) {
        return (highlights as number[][]).some(([start, end]) => line >= start && line <= end);
      } else {
        const [start, end] = highlights as number[];
        return line >= start && line <= end;
      }
    };

    return {
      line(node, line) {
        if (isHighlighted(line)) {
          this.addClassToHast(node, 'highlighted');
        }
      }
    };
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.code()) {
      this.content.set(null);
      return;
    }
    this.isLoading.set(true);
    try {
      const highlighted = await codeToHtml(
        this.code(),
        {
          lang: this.language(),
          theme: this.theme(),
          transformers: [diffTransformer, this.getHighlightTransformer()],
          diff: this.diff()
        } as any
      );
      this.content.set(this.sanitizer.bypassSecurityTrustHtml(highlighted));
    } catch (e) {
      // Fallback: raw code escaped inside pre
      const escaped = this.code()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const fallback = `<pre class="shiki"><code>${escaped}</code></pre>`;
      this.content.set(this.sanitizer.bypassSecurityTrustHtml(fallback));
      console.error('CodeHighlighter error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  copied = signal(false);
  private copyTimeout?: any;

  copyCode() {
    if (this.code()) {
      navigator.clipboard.writeText(this.code());
      this.copied.set(true);

      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }

      this.copyTimeout = setTimeout(() => {
        this.copied.set(false);
        this.copyTimeout = undefined;
      }, 2000);
    }
  }
}
