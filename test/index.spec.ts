import test from "ava";
import { transform } from "babel-core";
import generateLibdefs = require("../src/index");

test("Should expose a function", t => {
  t.truthy(typeof generateLibdefs === 'function');
});

test("Should generate a basic libdef for a class", t => {
  const input = `
/** Foo bar utility class. */
class Foo { }
`;
  const output = transform(input, {
    comments: true,
    shouldPrintComment: () => true,
    plugins: [generateLibdefs]
  });
  t.snapshot(input, 'input');
  t.snapshot(output.code, 'output');
});
