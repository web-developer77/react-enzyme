import { REACT013 } from './version';

let TestUtils;
let createShallowRenderer;
let renderToStaticMarkup;
let renderIntoDocument;
let findDOMNode;
if (REACT013) {
  renderToStaticMarkup = require('react').renderToStaticMarkup;
  findDOMNode = require('react').findDOMNode;
  TestUtils = require('react/addons').addons.TestUtils;
  createShallowRenderer = TestUtils.createRenderer;
  renderIntoDocument = TestUtils.renderIntoDocument;
} else {
  renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
  findDOMNode = require('react-dom').findDOMNode;
  // We require the testutils, but they don't come with 0.14 out of the box, so we
  // require them here through this node module. The bummer is that we are not able
  // to list this as a dependency in package.json and have 0.13 work properly.
  // As a result, right now this is basically an implicit dependency.
  TestUtils = require('react-addons-test-utils');

  // Shallow rendering changed from 0.13 => 0.14 in such a way that
  // 0.14 now does not allow shallow rendering of native DOM elements.
  // This is mainly because the result of such a call should not realistically
  // be any different than the JSX you passed in (result of `React.createElement`.
  // In order to maintain the same behavior across versions, this function
  // is essentially a replacement for `TestUtils.createRenderer` that doesn't use
  // shallow rendering when it's just a DOM element.
  createShallowRenderer = function createRendererCompatible() {
    const renderer = TestUtils.createRenderer();
    let isDOM = false;
    let _node;
    return {
      _instance: renderer._instance,
      render(node) {
        if (typeof node.type === 'string') {
          isDOM = true;
          _node = node;
        } else {
          isDOM = false;
          renderer.render(node);
          this._instance = renderer._instance;
        }
      },
      getRenderOutput() {
        if (isDOM) {
          return _node;
        }
        return renderer.getRenderOutput();
      },
    };
  };
  renderIntoDocument = TestUtils.renderIntoDocument;
}

const {
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isCompositeComponentElement,
  Simulate,
  findAllInRenderedTree,
} = TestUtils;

export default {
  createShallowRenderer,
  renderToStaticMarkup,
  renderIntoDocument,
  mockComponent,
  isElement,
  isElementOfType,
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isCompositeComponentElement,
  Simulate,
  findDOMNode,
  findAllInRenderedTree,
};
