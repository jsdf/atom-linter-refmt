'use babel';
// @flow

// work around flow libdefs not correctly typing regexp match result
function getMatchIndex(match /*: Array<string>*/) /*: number*/ {
  const unsafeMatch /*: any*/ = match;
  return unsafeMatch.index;
}

function getMatches(
  regexp /*: RegExp*/,
  input /*: string*/
) /*: Array<Array<string>>*/ {
  if (!regexp.flags.includes('g')) {
    throw new Error('expected regexp with g flag set');
  }
  const matches = [];
  let match = null;
  while ((match = regexp.exec(input))) {
    matches.push(match);
  }
  return matches;
}

/*:: type ErrorType = 'Error' | 'Warning';*/

function getErrorMessageType(typeString /*: string*/) /*: ErrorType*/ {
  switch (typeString) {
    case 'Error':
    case 'Warning':
      return typeString;
  }
  throw new Error(`unknown message type '${typeString}'`);
}

/*::
type ParsedError = {
  text: string,
  type: ErrorType,
  range: [[number, number], [number, number]],
};
*/

export function parseRefmtErrors(
  errorsText /*: ?string*/
) /*: Array<ParsedError>*/ {
  if (typeof errorsText !== 'string') {
    return [];
  }

  const matches = getMatches(
    /File "(.*?)", line (\d+), characters (\d+)-(\d+):\r?\n(Error|Warning)[:]? /g,
    errorsText
  );

  const errors = [];
  for (var i = 0; i < matches.length; i++) {
    const match = matches[i];

    const filename = match[1];
    const line = match[2];
    const colStart = match[3];
    const colEnd = match[4];
    const type = getErrorMessageType(match[5]);
    const nextMatchIndex = matches[i + 1]
      ? getMatchIndex(matches[i + 1])
      : null;
    let message = errorsText.slice(
      getMatchIndex(match) + match[0].length,
      nextMatchIndex || errorsText.length
    );
    const range = [
      [parseInt(line) - 1, parseInt(colStart)],
      [parseInt(line) - 1, parseInt(colEnd)],
    ];
    errors.push({
      text: `${type} ${message.trim()}`,
      type,
      range,
    });
  }
  return errors;
}
