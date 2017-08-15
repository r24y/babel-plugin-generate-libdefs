import test from "ava";
import { transform } from "babel-core";
import generateLibdefs = require("../src/index");

test("Should expose a function", t => {
  t.truthy(typeof generateLibdefs === 'function');
});

test("Should generate a basic libdef for an empty class", t => {
  const input = `
/** Foo bar utility class. */
class Foo { }
`;
  const output = transform(input, {
    comments: true,
    shouldPrintComment: () => true,
    plugins: ['syntax-jsx', 'syntax-flow', 'syntax-class-properties', generateLibdefs],
  });
  t.snapshot(input, 'input');
  t.snapshot(output.code, 'output');
});


test("Should generate a libdef for classes with prop types defined", t => {
  const input = `
/** Foo bar utility class. */
class Foo extends SomeNamespace.Base {
  /** String value of bar. */
  bar: string;

  /** Numeric value of baz. */
  baz: number;

  /** Should get marked with the \`*\` existential type param. */
  shouldBeExistential = {};

  /** Do Foo on props and return whether it was successful. */
  doFoo(props: Object, state: Object): boolean {}
}
`;
  const output = transform(input, {
    comments: true,
    shouldPrintComment: () => true,
    plugins: ['syntax-jsx', 'syntax-flow', 'syntax-class-properties', generateLibdefs]
  });
  t.snapshot(input, 'input');
  t.snapshot(output.code, 'output');
});
