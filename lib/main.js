'use babel';

import {BufferedProcess} from 'atom';

function refmt(editor, parse = 're', format = 're') {
  const command = atom.config.get('linter-refmt.refmtPath');
  const rei = editor.getPath() && editor.getPath().endsWith('.rei')
    ? 'true'
    : 'false';
  const args = [`--interface=${rei}`, `--print=${format}`, `--parse=${parse}`];
  return new Promise((resolve, reject) => {
    const out = [];
    const err = [];
    const stdout = content => out.push(content);
    const stderr = content => err.push(content);
    function exit(code) {
      if (code) {
        reject(err.join(''));
      } else {
        resolve(out.join(''));
      }
    }
    const bp = new BufferedProcess({command, args, stdout, stderr, exit});
    bp.process.stdin.write(editor.getText());
    bp.process.stdin.end();
  });
}

function parseRefmtError(error) {
  if (typeof error !== 'string') {
    return null;
  }
  const match = error.match(
    /^File "(.*?)", line (\d+), characters (\d+)-(\d+):\r?\nError: ([\s\S]+)$/
  );
  if (match) {
    const filename = match[1];
    const line = match[2];
    const colStart = match[3];
    const colEnd = match[4];
    const message = match[5];
    const range = [
      [parseInt(line) - 1, parseInt(colStart)],
      [parseInt(line) - 1, parseInt(colEnd)],
    ];
    return {
      text: `Error ${message.trim()}`,
      range,
    };
  }
  return null;
}

export function provideLinter() {
  return {
    name: 'refmt',
    scope: 'file',
    lintOnFly: true,
    grammarScopes: ['source.reason'],
    async lint(editor) {
      const messages = [];
      try {
        const text = await refmt(editor);
      } catch (err) {
        const parsedError = parseRefmtError(err);
        if (parsedError) {
          messages.push({
            type: 'Error',
            text: parsedError.text,
            range: parsedError.range,
            filePath: editor.getPath(),
          });
        } else {
          throw err;
        }
      }
      return messages;
    },
  };
}
