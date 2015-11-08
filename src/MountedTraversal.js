import {
  nodeEqual,
  isSimpleSelector,
  splitSelector,
  selectorError,
  isCompoundSelector,
  AND,
} from './Utils';
import {
  isDOMComponent,
  isCompositeComponent,
  isCompositeComponentWithType,
  isElement,
  findDOMNode,
} from './react-compat';
import { REACT013, REACT014 } from './version';

export function internalInstance(inst) {
  return inst._reactInternalInstance;
}

export function getNode(inst) {
  if (!inst || inst._store || typeof inst === 'string') {
    return inst;
  }
  if (inst._currentElement) {
    return inst._currentElement;
  }
  if (internalInstance(inst)) {
    return internalInstance(inst)._currentElement;
  }
  if (inst._reactInternalComponent) {
    return inst._reactInternalComponent._currentElement;
  }
  return inst;
}

export function instEqual(a, b) {
  return nodeEqual(getNode(a), getNode(b));
}

export function instHasClassName(inst, className) {
  if (!isDOMComponent(inst)) {
    return false;
  }
  const classes = findDOMNode(inst).className || '';
  return (' ' + classes + ' ').indexOf(' ' + className + ' ') > -1;
}

export function instHasId(inst, id) {
  if (!isDOMComponent(inst)) return false;
  const instId = findDOMNode(inst).id || '';
  return instId === id;
}

export function instHasType(inst, type) {
  switch (typeof type) {
  case 'string':
    return isDOMComponent(inst) &&
      inst.tagName.toUpperCase() === type.toUpperCase();
  case 'function':
    return isCompositeComponentWithType(inst, type);
  default:
    return false;
  }
}

// called with private inst
export function renderedChildrenOfInst(inst) {
  return REACT013
    ? inst._renderedComponent._renderedChildren
    : inst._renderedChildren;
}

// called with a private instance
export function childrenOfInstInternal(inst) {
  if (!inst) {
    return [];
  }
  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return childrenOfInstInternal(internal);
  }
  const publicInst = inst.getPublicInstance();
  const currentElement = inst._currentElement;
  if (isDOMComponent(publicInst)) {
    const children = [];
    const renderedChildren = renderedChildrenOfInst(inst);
    let key;
    for (key in renderedChildren) {
      if (!renderedChildren.hasOwnProperty(key)) {
        continue;
      }
      if (REACT013 && !renderedChildren[key].getPublicInstance) {
        continue;
      }
      children.push(renderedChildren[key].getPublicInstance());
    }
    return children;
  } else if (
    REACT014 &&
    isElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    return childrenOfInstInternal(inst._renderedComponent);
  } else if (
    REACT013 &&
    isCompositeComponent(publicInst)
  ) {
    return childrenOfInstInternal(inst._renderedComponent);
  }
  return [];
}

export function childrenOfInst(node) {
  let inst = node;
  // TODO: we could refactor this into a function...
  if (REACT013) {
    inst = node;
  } else if (node._reactInternalComponent) {
    inst = node._reactInternalComponent;
  } else if (node._reactInternalInstance) {
    inst = node._reactInternalInstance;
  }
  return childrenOfInstInternal(inst);
}

export function pathToNode(node, root) {
  const queue = [root];
  const path = [];

  while (queue.length) {
    const current = queue.pop();
    const children = childrenOfInst(current);

    if (current === node) return path;

    path.push(current);

    if (children.length === 0) {
      // leaf node. if it isn't the node we are looking for, we pop.
      path.pop();
    }
    queue.push.apply(queue, children);
  }

  return null;
}

export function parentsOfInst(inst, root) {
  return pathToNode(inst, root).reverse();
}

export function buildInstPredicate(selector) {
  switch (typeof selector) {
  case 'function':
    // selector is a component constructor
    return inst => instHasType(inst, selector);

  case 'string':
    if (!isSimpleSelector(selector)) {
      throw selectorError(selector);
    }
    if (isCompoundSelector.test(selector)) {
      return AND(splitSelector(selector).map(buildInstPredicate));
    }
    if (selector[0] === '.') {
      // selector is a class name
      return inst => instHasClassName(inst, selector.substr(1));
    } else if (selector[0] === '#') {
      // selector is an id name
      return inst => instHasId(inst, selector.substr(1));
    }
    // selector is a string. match to DOM tag or constructor displayName
    return inst => instHasType(inst, selector);

  default:
    throw new TypeError('Expecting a string or Component Constructor');
  }
}

// called with private inst
function findAllInRenderedTreeInternal(inst, test) {
  if (!inst) {
    return [];
  }
  if (!inst.getPublicInstance) {
    const internal = internalInstance(inst);
    return findAllInRenderedTreeInternal(internal, test);
  }

  const publicInst = inst.getPublicInstance();
  let ret = test(publicInst) ? [publicInst] : [];
  const currentElement = inst._currentElement;
  if (isDOMComponent(publicInst)) {
    const renderedChildren = renderedChildrenOfInst(inst);
    let key;
    for (key in renderedChildren) {
      if (!renderedChildren.hasOwnProperty(key)) {
        continue;
      }
      if (REACT013 && !renderedChildren[key].getPublicInstance) {
        continue;
      }
      ret = ret.concat(
        findAllInRenderedTreeInternal(renderedChildren[key], test)
      );
    }
  } else if (
    REACT014 &&
    isElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    ret = ret.concat(
      findAllInRenderedTreeInternal(
        inst._renderedComponent,
        test
      )
    );
  } else if (
    REACT013 &&
    isCompositeComponent(publicInst)
  ) {
    ret = ret.concat(
      findAllInRenderedTreeInternal(
        inst._renderedComponent,
        test
      )
    );
  }
  return ret;
}

// called with public inst
export function treeFilter(node, test) {
  let inst = node;
  if (REACT013) {
    inst = node;
  } else if (node._reactInternalComponent) {
    inst = node._reactInternalComponent;
  } else if (node._reactInternalInstance) {
    inst = node._reactInternalInstance;
  }
  return findAllInRenderedTreeInternal(inst, test);
}
