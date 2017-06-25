'use babel';
// @flow

// $FlowFixMe
import {BufferedProcess} from 'atom';
import {parseRefmtErrors} from './parseRefmtErrors';

function refmt(editor, parse = 're', format = 're') {
  // $FlowFixMe
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

/*::
type LinterMessageType = 'Error' | 'Warning';
type LinterMessage = {
  text: string,
  type: LinterMessageType,
  range: [[number, number], [number, number]],
  filePath: string,
};
*/

export function provideLinter() {
  return {
    name: 'refmt',
    scope: 'file',
    lintOnFly: true,
    grammarScopes: ['source.reason'],
    async lint(editor /*: Object*/) /*: Promise<Array<LinterMessage>>*/ {
      const messages = [];
      try {
        const text = await refmt(editor);
      } catch (err) {
        const parsedErrors = parseRefmtErrors(err);
        if (parsedErrors.length === 0) throw err;
        parsedErrors.forEach(parsedError => {
          messages.push({
            ...parsedError,
            filePath: editor.getPath(),
          });
        });
      }
      return messages;
    },
  };
}
