import React from 'react';
import { expect } from 'chai';
import { shallow, simulate, render, ShallowWrapper } from '../';
import sinon from 'sinon';


describe('shallow', () => {

  describe('.contains(node)', () => {

    it('should allow matches on the root node', () => {
      const a = <div className="foo" />;
      const b = <div className="foo" />;
      const c = <div className="bar" />;
      expect(shallow(a).contains(b)).to.be.true;
      expect(shallow(a).contains(c)).to.be.false;
    });

    it('should allow matches on a nested node', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
        </div>
      );
      const b = <div className="foo" />;
      expect(wrapper.contains(b)).to.be.true;
    });

    it('should match composite components', () => {
      class Foo extends React.Component {
        render() { return <div /> }
      }
      const wrapper = shallow(
        <div>
          <Foo />
        </div>
      );
      const b = <Foo />;
      expect(wrapper.contains(b)).to.be.true;
    });

  });

  describe('.find(selector)', () => {

    it('should find an element based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find(".foo").type()).to.equal("input");
    });

    it('should find an element based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
        </div>
      );
      expect(wrapper.find("input").props().className).to.equal("foo");
    });

    it('should find a component based on a constructor', () => {
      class Foo extends React.Component {
        render() { return <div />; }
      }
      const wrapper = shallow(
        <div>
          <Foo className="foo" />
        </div>
      );
      expect(wrapper.find(Foo).type()).to.equal(Foo);
    });

    it('should find multiple elements based on a class name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <button className="foo" />
        </div>
      );
      expect(wrapper.find(".foo").length).to.equal(2);
    });

    it('should find multiple elements based on a tag name', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.find('input').length).to.equal(2);
      expect(wrapper.find('button').length).to.equal(1);
    });

    it('should find multiple elements based on a constructor', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(wrapper.find('input').length).to.equal(2);
      expect(wrapper.find('button').length).to.equal(1);
    });

    it('should throw on a complex selector', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
          <button />
        </div>
      );
      expect(() => wrapper.find('.foo .foo')).to.throw;
    });

  });

  describe('.findWhere(predicate)', () => {

    it('should return all elements for a truthy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(x=>true).length).to.equal(3);
    });

    it('should return no elements for a falsy test', () => {
      const wrapper = shallow(
        <div>
          <input className="foo" />
          <input />
        </div>
      );
      expect(wrapper.findWhere(x=>false).length).to.equal(0);
    });

  });

  describe('.setProps(newProps)', () => {

    it('should set props for a component multiple times', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div className={this.props.id}>
              {this.props.id}
            </div>
          )
        }
      }
      const wrapper = shallow(<Foo id="foo" />);
      expect(wrapper.find('.foo').length).to.equal(1);
      wrapper.setProps({ id: "bar", foo: "bla"});
      expect(wrapper.find('.bar').length).to.equal(1);
    });

    it('should call componentWillReceiveProps for new renders', () => {

      const spy = sinon.spy();

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.componentWillReceiveProps = spy;
        }
        render() {
          return (
            <div className={this.props.id}>
              {this.props.id}
            </div>
          );
        }
      }
      const nextProps = { id: "bar", foo: "bla"};
      const wrapper = shallow(<Foo id="foo" />);
      expect(spy.calledOnce).to.be.false;
      wrapper.setProps(nextProps);
      expect(spy.calledOnce).to.be.true;
      expect(spy.calledWith(nextProps)).to.be.true;
    });

  });

  describe('.simulate(eventName, data)', () => {

    it('should simulate events', () => {

      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { count: 0 };
        }
        render() {
          return (
            <a
              className={`clicks-${this.state.count}`}
              onClick={() => this.setState({ count: this.state.count + 1 })}
            >foo</a>
          );
        }
      }

      const wrapper = shallow(<Foo />);

      expect(wrapper.find('.clicks-0').length).to.equal(1);
      wrapper.simulate('click');
      expect(wrapper.find('.clicks-1').length).to.equal(1);

    });


    it('should pass in event data', () => {
      const spy = sinon.spy();
      class Foo extends React.Component {
        render() {
          return (
            <a onClick={spy}>foo</a>
          );
        }
      }

      const wrapper = shallow(<Foo />);
      const a = {};
      const b = {};

      wrapper.simulate('click', a, b);
      expect(spy.args[0][0]).to.equal(a);
      expect(spy.args[0][1]).to.equal(b);
    });

  });

  describe('.setState(newState)', () => {
    it('should set the state of the root node', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { id: 'foo' };
        }
        render() {
          return (
            <div className={this.state.id}/>
          )
        }
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.find('.foo').length).to.equal(1);
      wrapper.setState({ id: "bar" });
      expect(wrapper.find('.bar').length).to.equal(1);
    });
  });

  describe('.is(selector)', () => {
    it('should return true when selector matches current element', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is(".foo")).to.be.true;
    });

    it('should allow for compound selectors', () => {
      const wrapper = shallow(<div className="foo bar baz" />);
      expect(wrapper.is(".foo.bar")).to.be.true;
    });

    it('should return false when selector does not match', () => {
      const wrapper = shallow(<div className="bar baz" />);
      expect(wrapper.is(".foo")).to.be.false;
    });
  });

  describe('.not(selector)', () => {
    it('filters to things not matching a selector', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz" />
          <div className="baz" />
          <div className="foo bar" />
        </div>
      );

      expect(wrapper.find('.foo').not('.bar').length).to.equal(1);
      expect(wrapper.find('.baz').not('.foo').length).to.equal(2);
      expect(wrapper.find('.foo').not('div').length).to.equal(0);
    });
  });

  describe('.filter(selector)', () => {
    it('should return a new wrapper of just the nodes that matched the selector', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar baz" />
          <div className="foo" />
          <div className="bar baz">
            <div className="foo bar baz" />
            <div className="foo" />
          </div>
          <div className="baz" />
          <div className="foo bar" />
        </div>
      );

      expect(wrapper.find('.foo').filter('.bar').length).to.equal(3);
      expect(wrapper.find('.bar').filter('.foo').length).to.equal(3);
      expect(wrapper.find('.bar').filter('.bax').length).to.equal(0);
      expect(wrapper.find('.foo').filter('.baz.bar').length).to.equal(2);
    });

    it('should only look in the current wrappers nodes, not their children', () => {
      const wrapper = shallow(
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="foo bar" />
        </div>
      );

      expect(wrapper.find('.foo').filter('.bar').length).to.equal(1);
    });
  });

  describe('.filterWhere(predicate)', () => {
    it('should filter only the nodes of the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      );

      const stub = sinon.stub();
      stub.onCall(0).returns(false);
      stub.onCall(1).returns(true);
      stub.onCall(2).returns(false);

      const baz = wrapper.find('.foo').filterWhere(stub);
      expect(baz.length).to.equal(1);
      expect(baz.hasClass('baz')).to.be.true;
    });
    
    it('should call the predicate with the node as the first argument', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bar" />
          <div className="foo baz" />
          <div className="foo bux" />
        </div>
      );

      const stub = sinon.stub();
      stub.returns(true);
      const spy = sinon.spy(stub);
      const baz = wrapper.find('.foo').filterWhere(spy);
      expect(spy.callCount).to.equal(3);
      expect(spy.args[0][0]).to.equal(wrapper.find('.bar').node);
      expect(spy.args[1][0]).to.equal(wrapper.find('.baz').node);
      expect(spy.args[2][0]).to.equal(wrapper.find('.bux').node);
    });
  });

  describe('.text()', () => {

    const matchesRender = function matchesRender(node) {
      const actual = shallow(node).text();
      const expected = render(node).text();
      expect(expected).to.equal(actual);
    };

    it('should handle simple text nodes', () => {
      const wrapper = shallow(
        <div>some text</div>
      );
      expect(wrapper.text()).to.equal('some text');
    });

    it('should handle nodes with mapped children', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              {this.props.items.map(x=>x)}
            </div>
          );
        }
      }
      matchesRender(<Foo items={['abc', 'def', 'hij']} />);
      matchesRender(
        <Foo items={[
          <i key={1}>abc</i>,
          <i key={2}>def</i>,
          <i key={3}>hij</i>
          ]}
        />
      );
    });

    it('should render composite components dumbly', () => {
      class Foo extends React.Component {
        render() { return <div/>; }
      }
      const wrapper = shallow(
        <div>
          <Foo />
          <div>test</div>
        </div>
      );
      expect(wrapper.text()).to.equal('<Foo />test');
    });

    it('should handle html entities', () => {
      matchesRender(<div>&gt;</div>);
    });

  });

  describe('.props()', () => {

    it('should return the props object', () => {
      const fn = ()=>{};
      const wrapper = shallow(
        <div id="fooId"  className="bax" onClick={fn} >
          <div className="baz" />
          <div className="foo" />
        </div>
      );

      expect(wrapper.props().className).to.equal("bax");
      expect(wrapper.props().onClick).to.equal(fn);
      expect(wrapper.props().id).to.equal("fooId");

    });

    it('should be allowed to be used on an inner node', () => {
      const fn = ()=>{};
      const wrapper = shallow(
        <div className="bax">
          <div className="baz" onClick={fn} />
          <div className="foo" id="fooId" />
        </div>
      );

      expect(wrapper.find('.baz').props().onClick).to.equal(fn);
      expect(wrapper.find('.foo').props().id).to.equal("fooId");
    });
  });

  describe('.state(name)', () => {

    it('should return the state object', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' }
        }
        render() { return <div />}
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state()).to.eql({ foo: 'foo' });
    });

    it('should return the current state after state transitions', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' }
        }
        render() { return <div />}
      }
      const wrapper = shallow(<Foo />);
      wrapper.setState({ foo: 'bar' });
      expect(wrapper.state()).to.eql({ foo: 'bar' });
    });

    it('should allow a state property name be passed in as an argument', () => {
      class Foo extends React.Component {
        constructor(props) {
          super(props);
          this.state = { foo: 'foo' }
        }
        render() { return <div />}
      }
      const wrapper = shallow(<Foo />);
      expect(wrapper.state('foo')).to.equal('foo');
    });
  });

  describe('.children()', () => {
    it('should return empty wrapper for node with no children', () => {
      const wrapper = shallow(<div />);
      expect(wrapper.children().length).to.equal(0);
    });
    
    it('should return the children nodes of the root', () => {
      const wrapper = shallow(
        <div>
          <div className="foo" />
          <div className="bar" />
          <div className="baz" />
        </div>
      );
      expect(wrapper.children().length).to.equal(3);
      expect(wrapper.children().get(0).hasClass("foo")).to.be.true;
      expect(wrapper.children().get(1).hasClass("bar")).to.be.true;
      expect(wrapper.children().get(2).hasClass("baz")).to.be.true;
    });

    it('should not return any of the children of children', () => {
      const wrapper = shallow(
        <div>
          <div className="foo">
            <div className="bar" />
          </div>
          <div className="baz" />
        </div>
      );
      expect(wrapper.children().length).to.equal(2);
      expect(wrapper.children().get(0).hasClass("foo")).to.be.true;
      expect(wrapper.children().get(1).hasClass("baz")).to.be.true;
    });

    it('should handle mixed children with and without arrays', () => {
      class Foo extends React.Component {
        render() {
          return (
            <div>
              <span className="foo"></span>
              {this.props.items.map(x=>x)}
            </div>
          );
        }
      }
      const wrapper = shallow(
        <Foo items={[
          <i key={1} className="bar">abc</i>,
          <i key={2} className="baz">def</i>,
        ]} />
      );
      expect(wrapper.children().length).to.equal(3);
      expect(wrapper.children().get(0).hasClass("foo")).to.be.true;
      expect(wrapper.children().get(1).hasClass("bar")).to.be.true;
      expect(wrapper.children().get(2).hasClass("baz")).to.be.true;
    });
  });

  describe('.parents()', () => {
    it('should return an array of current nodes ancestors', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      const parents = wrapper.find('.baz').parents();

      expect(parents.length).to.equal(3);
      expect(parents.get(0).hasClass('bar')).to.be.true;
      expect(parents.get(1).hasClass('foo')).to.be.true;
      expect(parents.get(2).hasClass('bax')).to.be.true;

    });

    it('should work for non-leaf nodes as well', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      const parents = wrapper.find('.bar').parents();

      expect(parents.length).to.equal(2);
      expect(parents.get(0).hasClass('foo')).to.be.true;
      expect(parents.get(1).hasClass('bax')).to.be.true;
    });
  });

  describe('.parent()', () => {
    it('should return only the immediate parent of the node', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.be.true;
    });
  });

  describe('.closest()', () => {
    it('should return the closest ancestor for a given selector', () => {
      const wrapper = shallow(
        <div className="foo">
          <div className="foo baz">
            <div className="bax">
              <div className="bar" />
            </div>
          </div>
        </div>
      );

      const closestFoo = wrapper.find('.bar').closest('.foo');
      expect(closestFoo.hasClass('baz')).to.be.true;
      expect(closestFoo.length).to.equal(1);
    });

    it('should only ever return a wrapper of a single node', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="bar">
              <div className="baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.baz').parent().hasClass('bar')).to.be.true;
    });

    it('should never return itself', () => {
      const wrapper = shallow(
        <div className="bax">
          <div className="foo">
            <div className="baz">
              <div className="bux baz" />
            </div>
          </div>
        </div>
      );

      expect(wrapper.find('.bux').closest('.baz').hasClass('bux')).to.be.false;
    });
  });

  describe('.hasClass(className)', () => {
    it('should return whether or not node has a certain class', () => {
      const wrapper = shallow(
        <div className="foo bar baz some-long-string FoOo" />
      );

      expect(wrapper.hasClass('foo')).to.be.true;
      expect(wrapper.hasClass('bar')).to.be.true;
      expect(wrapper.hasClass('baz')).to.be.true;
      expect(wrapper.hasClass('some-long-string')).to.be.true;
      expect(wrapper.hasClass('FoOo')).to.be.true;
      expect(wrapper.hasClass('doesnt-exist')).to.be.false;
    });
  });

  describe('.forEach(fn)', () => {
    it('should call a function for each node in the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy();

      wrapper.find('.foo').forEach(spy);

      expect(spy.callCount).to.equal(3);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.be.true;
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.be.true;
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.be.true;
    });
  });

  describe('.map(fn)', () => {
    it('should call a function with a wrapper for each node in the wrapper', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const spy = sinon.spy();

      wrapper.find('.foo').map(spy);

      expect(spy.callCount).to.equal(3);
      expect(spy.args[0][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[0][0].hasClass('bax')).to.be.true;
      expect(spy.args[1][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[1][0].hasClass('bar')).to.be.true;
      expect(spy.args[2][0]).to.be.instanceOf(ShallowWrapper);
      expect(spy.args[2][0].hasClass('baz')).to.be.true;
    });

    it('should return an array with the mapped values', () => {
      const wrapper = shallow(
        <div>
          <div className="foo bax" />
          <div className="foo bar" />
          <div className="foo baz" />
        </div>
      );
      const result = wrapper.find('.foo').map(w => w.props().className);

      expect(result).to.eql([
        "foo bax",
        "foo bar",
        "foo baz"
      ]);
    });
  });

  describe('.flatMap(fn)', () => {
    it('should return a wrapper with the mapped and flattened nodes', () => {
      const wrapper = shallow(
        <div>
          <div className="foo">
            <div className="bar" />
            <div className="bar" />
          </div>
          <div className="foo">
            <div className="baz" />
            <div className="baz" />
          </div>
          <div className="foo">
            <div className="bax" />
            <div className="bax" />
          </div>
        </div>
      );

      const nodes = wrapper.find('.foo').flatMap(w => w.children().nodes);

      expect(nodes.length).to.equal(6);
      expect(nodes.get(0).hasClass('bar')).to.be.true;
      expect(nodes.get(1).hasClass('bar')).to.be.true;
      expect(nodes.get(2).hasClass('baz')).to.be.true;
      expect(nodes.get(3).hasClass('baz')).to.be.true;
      expect(nodes.get(4).hasClass('bax')).to.be.true;
      expect(nodes.get(5).hasClass('bax')).to.be.true;
    });
  });

  describe('.first()', () => {
    it('should return the first node in the current set', () => {
      const wrapper = shallow(
        <div>
          <div className="bar baz" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>
      );
      expect(wrapper.find('.bar').first().hasClass('baz')).to.be.true;
    });
  });

  describe('.last()', () => {
    it('should return the last node in the current set', () => {
      const wrapper = shallow(
        <div>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
          <div className="bar baz" />
        </div>
      );
      expect(wrapper.find('.bar').last().hasClass('baz')).to.be.true;
    });
  });

  describe('.isEmpty()', () => {
    it('should return true iff wrapper is empty', () => {
      const wrapper = shallow(
        <div className="foo" />
      );
      expect(wrapper.find('.bar').isEmpty()).to.be.true;
      expect(wrapper.find('.foo').isEmpty()).to.be.false;
    });
  });

  describe('.get(index)', () => {
    it('gets the node at the specified index', () => {
      const wrapper = shallow(
        <div>
          <div className="bar foo" />
          <div className="bar bax" />
          <div className="bar bux" />
          <div className="bar baz" />
        </div>
      );
      expect(wrapper.find('.bar').get(0).hasClass('foo')).to.be.true;
      expect(wrapper.find('.bar').get(1).hasClass('bax')).to.be.true;
      expect(wrapper.find('.bar').get(2).hasClass('bux')).to.be.true;
      expect(wrapper.find('.bar').get(3).hasClass('baz')).to.be.true;
    });
  });

  describe('.debug()', () => {
    it('should pass through to the debugNodes function', () => {
      expect(shallow(<div />).debug()).to.equal('<div />');
    });
  });

});
