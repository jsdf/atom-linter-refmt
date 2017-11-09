'use babel';
// @flow

// $FlowFixMe
import {BufferedProcess} from 'atom';
import {parseRefmtErrors} from './parseRefmtErrors';

function getNotificationsManager(): Object {
  // $FlowFixMe
  return atom.notifications;
}

function getAtomConfig(): Object {
  // $FlowFixMe
  return atom.config;
}

function refmt(editor, parse = 're', format = 're') {
  const command = getAtomConfig().get('linter-refmt.refmtPath');
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
        resolve({text: null, errorText: err.join('')});
      } else {
        resolve({text: out.join(''), errorText: null});
      }
    }
    const bp = new BufferedProcess({command, args, stdout, stderr, exit});
    bp.onWillThrowError((errorObject) => {
      errorObject.handle();
      reject(errorObject.error);
    })
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
        const {text, errorText} = await refmt(editor);
        if (errorText) {
          const parsedErrors = parseRefmtErrors(errorText);
          if (parsedErrors.length === 0) {
            getNotificationsManager().addError(
              "Failed to parse refmt output",
              {detail: (errorText || '') + (text || ''), dismissable: true}
            );
          } else {
            parsedErrors.forEach(parsedError => {
              messages.push({
                ...parsedError,
                filePath: editor.getPath(),
              });
            });
          }
        }
      } catch (err) {
        if (err.code == "ENOENT") {
          getNotificationsManager().addError(
            "Failed to spawn command `refmt`. Make sure `refmt` is installed and on your PATH"
          );
        } else {
          getNotificationsManager().addError(
            err.message,
            {stack: err.stack, dismissable: true}
          )
        }
      }
      return messages;
    },
  };
}
