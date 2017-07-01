import {parseRefmtErrors} from './parseRefmtErrors';

test('single error', () => {
  expect(
    parseRefmtErrors(
      `File "", line 16, characters 34-35:
Error: 890: Expecting an expression
`
    )
  ).toMatchSnapshot();
});

test('multiple errors', () => {
  expect(
    parseRefmtErrors(
      `File "", line 1, characters 2-10:
Error: 321: Expecting an statement:
A
  b
File "", line 16, characters 34-35:
Error: 890: Expecting an expression`
    )
  ).toMatchSnapshot();
});

test('warning + error', () => {
  expect(
    parseRefmtErrors(
      `File "", line 16, characters 33-35:
Warning 2: this is not the end of a comment.
File "", line 16, characters 34-35:
Error: 890: Expecting an expression`
    )
  ).toMatchSnapshot();
});

test('no level', () => {
  expect(
    parseRefmtErrors(
      `File "", line 20, characters 7-8:
A type's name need to begin with a lower-case letter or _
`
    )
  ).toMatchSnapshot();
});
