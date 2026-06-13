import assert from "node:assert/strict";
import test from "node:test";

import { applyAction, createInitialState } from "../src/drawingState.js";

const circleAction = {
  type: "add-shape",
  shape: "circle",
  stroke: "#ef4444",
  fill: "#ef4444",
  strokeWidth: 4,
  text: ""
};

test("adds a shape to the drawing state", () => {
  const state = applyAction(createInitialState(), circleAction);

  assert.equal(state.shapes.length, 1);
  assert.equal(state.shapes[0].kind, "circle");
  assert.equal(state.shapes[0].stroke, "#ef4444");
  assert.equal(state.past.length, 1);
});

test("undo and redo restore drawing history", () => {
  const withShape = applyAction(createInitialState(), circleAction);
  const undone = applyAction(withShape, { type: "undo" });
  const redone = applyAction(undone, { type: "redo" });

  assert.equal(undone.shapes.length, 0);
  assert.equal(undone.future.length, 1);
  assert.equal(redone.shapes.length, 1);
});

test("clear removes all shapes and keeps history", () => {
  const withShape = applyAction(createInitialState(), circleAction);
  const cleared = applyAction(withShape, { type: "clear" });

  assert.equal(cleared.shapes.length, 0);
  assert.equal(cleared.past.length, 2);
});

test("move and resize update the last shape", () => {
  const withShape = applyAction(createInitialState(), circleAction);
  const moved = applyAction(withShape, { type: "move-last", direction: "right" });
  const resized = applyAction(moved, { type: "resize-last", scale: 1.2 });

  assert.ok(moved.shapes[0].x > withShape.shapes[0].x);
  assert.ok(resized.shapes[0].width > moved.shapes[0].width);
});

