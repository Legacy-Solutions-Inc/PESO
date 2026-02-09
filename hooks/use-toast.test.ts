import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { reducer } from './use-toast.ts';

// Mock setTimeout to prevent process from staying alive
mock.timers.enable();

// Mock data
const toast1 = {
  id: '1',
  title: 'Toast 1',
  open: true,
};

const toast2 = {
  id: '2',
  title: 'Toast 2',
  open: true,
};

describe('Toast Reducer', () => {
  test('ADD_TOAST should add a toast and respect TOAST_LIMIT', () => {
    const initialState = { toasts: [] };
    const action = { type: 'ADD_TOAST' as const, toast: toast1 };

    const state1 = reducer(initialState, action);
    assert.strictEqual(state1.toasts.length, 1);
    assert.deepStrictEqual(state1.toasts[0], toast1);

    // Should respect TOAST_LIMIT (which is 1)
    const action2 = { type: 'ADD_TOAST' as const, toast: toast2 };
    const state2 = reducer(state1, action2);
    assert.strictEqual(state2.toasts.length, 1);
    assert.deepStrictEqual(state2.toasts[0], toast2);
  });

  test('UPDATE_TOAST should update an existing toast', () => {
    const initialState = { toasts: [toast1] };
    const updatedToast = { id: '1', title: 'Updated Toast 1' };
    const action = { type: 'UPDATE_TOAST' as const, toast: updatedToast };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 1);
    assert.strictEqual(state.toasts[0].title, 'Updated Toast 1');
    assert.strictEqual(state.toasts[0].id, '1');
  });

  test('UPDATE_TOAST should not update if ID does not match', () => {
    const initialState = { toasts: [toast1] };
    const updatedToast = { id: 'non-existent', title: 'Updated Toast' };
    const action = { type: 'UPDATE_TOAST' as const, toast: updatedToast };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 1);
    assert.deepStrictEqual(state.toasts[0], toast1);
  });

  test('DISMISS_TOAST should set open to false for a specific toast', () => {
    const initialState = { toasts: [toast1] };
    const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 1);
    assert.strictEqual(state.toasts[0].open, false);
  });

  test('DISMISS_TOAST should set open to false for all toasts if no toastId provided', () => {
    const initialState = { toasts: [toast1, toast2] };
    const action = { type: 'DISMISS_TOAST' as const };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 2);
    assert.strictEqual(state.toasts[0].open, false);
    assert.strictEqual(state.toasts[1].open, false);
  });

  test('REMOVE_TOAST should remove a specific toast', () => {
    const initialState = { toasts: [toast1, toast2] };
    const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 1);
    assert.strictEqual(state.toasts[0].id, '2');
  });

  test('REMOVE_TOAST should remove all toasts if no toastId provided', () => {
    const initialState = { toasts: [toast1, toast2] };
    const action = { type: 'REMOVE_TOAST' as const };

    const state = reducer(initialState, action);
    assert.strictEqual(state.toasts.length, 0);
  });
});
