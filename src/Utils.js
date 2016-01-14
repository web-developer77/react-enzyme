/* eslint no-use-before-define:0 */
import { isEqual } from 'underscore';
import {
  isDOMComponent,
  findDOMNode,
} from './react-compat';
import {
  REACT013,
  REACT014,
} from './version';

export function propsOfNode(node) {
  if (REACT013) {
    return (node && node._store && node._store.props) || {};
  }
  return (node && node.props) || {};
}

export function onPrototype(Component, lifecycle, method) {
  const proto = Component.prototype;
  Object.getOwnPropertyNames(proto).forEach((name) => {
    if (typeof proto[name] !== 'function') return;
    switch (name) {
      case 'componentDidMount':
      case 'componentWillMount':
      case 'componentDidUnmount':
      case 'componentWillUnmount':
      case 'componentWillReceiveProps':
      case 'componentDidUpdate':
      case 'componentWillUpdate':
      case 'shouldComponentUpdate':
      case 'render':
        if (lifecycle) lifecycle(proto, name);
        break;
      case 'constructor':
        // don't spy on the constructor, even though it shows up in the prototype
        break;
      default:
        if (method) method(proto, name);
        break;
    }
  });
}

export function getNode(node) {
  return isDOMComponent(node) ? findDOMNode(node) : node;
}

export function childrenEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) && !Array.isArray(b)) {
    return nodeEqual(a, b);
  }
  if (!a && !b) return true;
  if (a.length !== b.length) return false;
  if (a.length === 0 && b.length === 0) return true;
  for (let i = 0; i < a.length; i++) {
    if (!nodeEqual(a[i], b[i])) return false;
  }
  return true;
}

export function nodeEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  const left = propsOfNode(a);
  const leftKeys = Object.keys(left);
  const right = propsOfNode(b);
  for (let i = 0; i < leftKeys.length; i++) {
    const prop = leftKeys[i];
    if (!(prop in right)) return false;
    if (prop === 'children') {
      if (!childrenEqual(left.children, right.children)) return false;
    } else if (right[prop] === left[prop]) {
      // continue;
    } else if (typeof right[prop] === typeof left[prop] && typeof left[prop] === 'object') {
      if (!isEqual(left[prop], right[prop])) return false;
    } else {
      return false;
    }
  }
  return leftKeys.length === Object.keys(right).length;
}

// 'click' => 'onClick'
// 'mouseEnter' => 'onMouseEnter'
export function propFromEvent(event) {
  return `on${event[0].toUpperCase()}${event.substring(1)}`;
}

export function withSetStateAllowed(fn) {
  // NOTE(lmr):
  // this is currently here to circumvent a React bug where `setState()` is
  // not allowed without global being defined.
  let cleanup = false;
  if (typeof global.document === 'undefined') {
    cleanup = true;
    global.document = {};
  }
  fn();
  if (cleanup) {
    delete global.document;
  }
}

export function splitSelector(selector) {
  return selector.split(/(?=\.|\[.*\])/);
}

export function isSimpleSelector(selector) {
  // any of these characters pretty much guarantee it's a complex selector
  return !/[~\s:>]/.test(selector);
}

export function selectorError(selector) {
  return new TypeError(
    `Enzyme received a complex CSS selector ('${selector}') that it does not currently support`
  );
}

export const isCompoundSelector = /([a-z]\.[a-z]|[a-z]\[.*\])/i;

const isPropSelector = /^\[.*\]$/;

export const SELECTOR = {
  CLASS_TYPE: 0,
  ID_TYPE: 1,
  PROP_TYPE: 2,
};

export function selectorType(selector) {
  if (selector[0] === '.') {
    return SELECTOR.CLASS_TYPE;
  } else if (selector[0] === '#') {
    return SELECTOR.ID_TYPE;
  } else if (isPropSelector.test(selector)) {
    return SELECTOR.PROP_TYPE;
  }
}

export function AND(fns) {
  return x => {
    let i = fns.length;
    while (i--) {
      if (!fns[i](x)) return false;
    }
    return true;
  };
}

export function coercePropValue(propValue) {
  // can be undefined
  if (propValue === undefined) {
    return propValue;
  }

  // if propValue includes quotes, it should be
  // treated as a string
  if (propValue.search(/"/) !== -1) {
    return propValue.replace(/"/g, '');
  }

  const numericPropValue = parseInt(propValue, 10);

  // if parseInt is not NaN, then we've wanted a number
  if (!isNaN(numericPropValue)) {
    return numericPropValue;
  }

  // coerce to boolean
  return propValue === 'true' ? true : false;
}

export function mapNativeEventNames(event) {
  const nativeToReactEventMap = {
    compositionend: 'compositionEnd',
    compositionstart: 'compositionStart',
    compositionupdate: 'compositionUpdate',
    keydown: 'keyDown',
    keyup: 'keyUp',
    keypress: 'keyPress',
    contextmenu: 'contextMenu',
    doubleclick: 'doubleClick',
    dragend: 'dragEnd',
    dragenter: 'dragEnter',
    dragexist: 'dragExit',
    dragleave: 'dragLeave',
    dragover: 'dragOver',
    dragstart: 'dragStart',
    mousedown: 'mouseDown',
    mousemove: 'mouseMove',
    mouseout: 'mouseOut',
    mouseover: 'mouseOver',
    mouseup: 'mouseUp',
    touchcancel: 'touchCancel',
    touchend: 'touchEnd',
    touchmove: 'touchMove',
    touchstart: 'touchStart',
    canplay: 'canPlay',
    canplaythrough: 'canPlayThrough',
    durationchange: 'durationChange',
    loadeddata: 'loadedData',
    loadedmetadata: 'loadedMetadata',
    loadstart: 'loadStart',
    ratechange: 'rateChange',
    timeupdate: 'timeUpdate',
    volumechange: 'volumeChange',
  };

  if (REACT014) {
    // these could not be simulated in React 0.13:
    // https://github.com/facebook/react/issues/1297
    nativeToReactEventMap.mouseenter = 'mouseEnter';
    nativeToReactEventMap.mouseleave = 'mouseLeave';
  }

  return nativeToReactEventMap[event] || event;
}
