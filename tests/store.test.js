import storeFactory from '../lib/store';
import { expect } from 'chai';
import _ from 'lodash';
import Rx from 'rx';

describe('store', () => {
  const testAction = { type: 'MY_TEST' };
  let store;

  beforeEach(() => {
    store = storeFactory();
  });


  describe('#apply', () => {
    it('register the given reducer to be executed when a action is dispatched', (done) => {
      const reducer = (action, state = {}) => {
        switch (action.type) {
          case 'MY_ACTION': {
            return Promise.resolve(_.assign({}, state, { test: 'foo' }));
          }
          default:
            return state;
        }
      };

      store.apply(reducer);
      store.dispatch({ type: 'MY_ACTION' });

      setTimeout(() => {
        expect(store.getState().test).to.be.eql('foo');
        done();
      }, 300);
    });
  });

  describe('#applySideEffect', () => {
    it('register the given sideEffect function to be called after all the reducers changed the state', () => {
      const spy = sinon.spy();
      const reducerSpy = sinon.spy((action, state) => state);
      store.apply(reducerSpy);
      store.applySideEffect(spy);

      store.dispatch({ type: 'MY_ACTION' });
      expect(spy.calledAfter(reducerSpy));
    });

    it('the sideEffect function does not change the state', () => {
      const sideEffect = (state) => _.assign(state, { foo: 32 });
      store.applySideEffect(sideEffect);

      store.dispatch({ type: 'MY_ACTION' });

      expect(store.getState().foo).to.be.eql(undefined);
    });
  });

  describe('#applyMiddleware', () => {
    it('register the given middleware function to be called before all the registered reducers', () => {
      const spy = sinon.spy((action, next) => next(action));
      const reducerSpy = sinon.spy((action, state) => state);
      store.apply(reducerSpy);
      store.applyMiddleware(spy);

      store.dispatch({ type: 'MY_ACTION' });
      expect(spy.calledAfter(reducerSpy));
    });

    it('the middleware function receives a action observable and the next middleware to call', (done) => {
      const middleware = (action, next) => {
        expect(action).to.be.instanceof(Rx.Observable);
        expect(next).to.be.instanceof(Function);
        done();
        return action;
      };

      store.applyMiddleware(middleware);

      store.dispatch({ type: 'MY_ACTION' });
    });

    it('can reject the given action based on any validation', () => {
      let myTest = false;
      const middleware = (action, next) => {
        if (myTest) {
          return next(action);
        }

        return action.skip(1);
      };

      const spy = sinon.spy((action, state) => state);
      store.apply(spy);
      store.applyMiddleware(middleware);

      store.dispatch({ type: 'MY_ACTION' });

      expect(spy.callCount).to.be.eql(0);

      myTest = true;
      store.dispatch({ type: 'MY_ACTION' });
      expect(spy.callCount).to.be.eql(1);
    });
  });

  describe('#subscribe', () => {
    it('registers the given function as a listener for any state change', (done) => {
      store.subscribe((state) => {
        expect(state).to.be.eql(store.getState());
        done();
      });

      store.dispatch(testAction);
    });

    it('returns a subscription to be disposed later', (done) => {
      const spy = sinon.spy();
      const subscription = store.subscribe(spy);

      subscription.dispose();

      store.dispatch(testAction);

      setTimeout(() => {
        expect(spy.callCount).to.be.eql(0);
        done();
      }, 100);
    });
  });
});
