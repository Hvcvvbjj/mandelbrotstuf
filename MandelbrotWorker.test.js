const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Load and evaluate the worker script in a sandboxed context
const code = fs.readFileSync('./MandelbrotWorker.js', 'utf8');
const context = {
  self: {
    addEventListener: () => {},
    postMessage: () => {}
  },
};
vm.runInNewContext(code, context);
const getColor = context.getColor;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (err) {
    console.error(`✗ ${description}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// Test that points inside the set are black
test('inside set returns black', () => {
  const color = Array.from(getColor(0.5, 10, 10, 'rainbow', false));
  assert.deepStrictEqual(color, [0, 0, 0]);
});

test('inside set with invert returns white', () => {
  const color = Array.from(getColor(0.5, 10, 10, 'rainbow', true));
  assert.deepStrictEqual(color, [255, 255, 255]);
});

// Rainbow scheme
test('rainbow scheme for ratio 0.5', () => {
  const color = Array.from(getColor(0.5, 5, 10, 'rainbow', false));
  assert.deepStrictEqual(color, [254, 254, 127]);
});

// Cool scheme
test('cool scheme for ratio 0.25', () => {
  const color = Array.from(getColor(0.25, 2, 8, 'cool', false));
  assert.deepStrictEqual(color, [0, 63, 191]);
});

test('fire scheme for ratio 0.25', () => {
  const color = Array.from(getColor(0.25, 2, 8, 'fire', false));
  assert.deepStrictEqual(color, [168, 127, 221]);
});

test('ocean scheme for ratio 0.25', () => {
  const color = Array.from(getColor(0.25, 2, 8, 'ocean', false));
  assert.deepStrictEqual(color, [191, 168, 63]);
});

test('monochrome scheme for ratio 0.25', () => {
  const color = Array.from(getColor(0.25, 2, 8, 'monochrome', false));
  assert.deepStrictEqual(color, [63, 63, 63]);
});

test('invert colors option', () => {
  const color = Array.from(getColor(0.25, 2, 8, 'cool', true));
  assert.deepStrictEqual(color, [255, 192, 64]);
});

