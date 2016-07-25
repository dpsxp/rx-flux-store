import { Observable, Subject } from 'rx';
import _ from 'lodash';

export default function storeFactory() {
  const state = {};
  const subject = new Subject();
  const stateSubject = new Subject();
  const reducers = [];
  const sideEffects = [];
  const middlewares = [reducerMiddleware];

  subject
    .flatMap((action) => reduce(Observable.of(action), middlewares[0], middlewares.slice(1)))
    .do((newState) => sideEffects.forEach(sideEffect => sideEffect(_.assign({}, newState))))
    .map(newState => _.assign(state, newState))
    .subscribe((newState) => stateSubject.onNext(newState));

  const store = {
    getState() {
      return _.assign({}, state);
    },

    applySideEffect(sideEffect) {
      sideEffects.push(sideEffect);
    },

    applyMiddleware(middleware) {
      middlewares.unshift(middleware);
    },

    apply(reducer) {
      reducers.push(reducer);
    },

    dispatch(action) {
      subject.onNext(action);
    },

    subscribe(listener) {
      return stateSubject.subscribe((newState) => listener(newState));
    },
  };

  return store;

  function reducerMiddleware(actionObservable) {
    return actionObservable.flatMap((action) => {
      const initialState = Observable.of(store.getState());
      return _.reduce(reducers, (newState, reducer) => reducer(action, newState), initialState);
    });
  }

  function reduce(action, next, collection) {
    if (!next) {
      return action;
    }

    if (!collection.length === 0) {
      return next(action);
    }

    return reduce(next(action, collection[0]), collection[1], collection.slice(2));
  }
}
