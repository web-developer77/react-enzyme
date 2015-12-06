import cheerio from 'cheerio';
import Sinon from 'sinon';
import ReactWrapper from './ReactWrapper';
import ShallowWrapper from './ShallowWrapper';
import { onPrototype } from './Utils';
import { renderToStaticMarkup } from './react-compat';

/**
 * @class Enzyme
 */

let jsdom;
try {
  require('jsdom'); // could throw
  jsdom = require('mocha-jsdom');
} catch (e) {
  // jsdom is not supported...
}

export let sinon = Sinon.sandbox.create();

export function describeWithDOM(a, b) {
  describe('(uses jsdom)', () => {
    if (typeof jsdom === 'function') {
      jsdom();
      describe(a, b);
    } else {
      // if jsdom isn't available, skip every test in this describe context
      describe.skip(a, b);
    }
  });
}

export function useSetStateHack() {
  let cleanup = false;
  before(() => {
    if (typeof global.document === 'undefined') {
      cleanup = true;
      global.document = {};
    }
  });
  after(() => {
    if (cleanup) {
      delete global.document;
    }
  });
}

export function spySetup() {
  sinon = Sinon.sandbox.create();
}

export function spyTearDown() {
  sinon.restore();
}

export function useSinon() {
  beforeEach(spySetup);
  afterEach(spyTearDown);
}

export function spyLifecycle(Component) {
  onPrototype(Component, (proto, name) => sinon.spy(proto, name));
}

export function spyMethods(Component) {
  onPrototype(Component, null, (proto, name) => sinon.spy(proto, name));
}

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ReactWrapper}
 */
export function mount(node) {
  return new ReactWrapper(node);
}

/**
 * Shallow renders a react component and provides a testing wrapper around it.
 *
 * @param node
 * @returns {ShallowWrapper}
 */
export function shallow(node) {
  return new ShallowWrapper(node);
}

/**
 * Renders a react component into static HTML and provides a cheerio wrapper around it. This is
 * somewhat asymmetric with `mount` and `shallow`, which don't use any external libraries, but
 * Cheerio's API is pretty close to what we actually want and has a significant amount of utility
 * that would be recreating the wheel if we didn't use it.
 *
 * I think there are a lot of good use cases to use `render` instead of `shallow` or `mount`, and
 * thus I'd like to keep this API in here even though it's not really "ours".
 *
 * @param node
 * @returns {Cheerio}
 */
export function render(node) {
  const html = renderToStaticMarkup(node);
  return cheerio.load(html).root();
}

export { ShallowWrapper as ShallowWrapper };
export { ReactWrapper as ReactWrapper };
