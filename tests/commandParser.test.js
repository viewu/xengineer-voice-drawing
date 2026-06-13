import assert from "node:assert/strict";
import test from "node:test";

import { parseCommandText } from "../src/commandParser.js";

test("parses a Chinese shape command with color and fill", () => {
  const result = parseCommandText("画一个红色实心圆形");

  assert.equal(result.actions.length, 1);
  assert.deepEqual(result.actions[0], {
    type: "add-shape",
    shape: "circle",
    stroke: "#ef4444",
    fill: "#ef4444",
    strokeWidth: 4,
    text: ""
  });
});

test("splits a complex command into multiple drawing actions", () => {
  const result = parseCommandText("画一个蓝色矩形，然后添加一条绿色箭头");

  assert.equal(result.actions.length, 2);
  assert.equal(result.actions[0].shape, "rectangle");
  assert.equal(result.actions[0].stroke, "#2563eb");
  assert.equal(result.actions[1].shape, "arrow");
  assert.equal(result.actions[1].stroke, "#16a34a");
});

test("parses English commands and stroke width", () => {
  const result = parseCommandText("draw a thick purple line");

  assert.equal(result.actions.length, 1);
  assert.deepEqual(result.actions[0], {
    type: "add-shape",
    shape: "line",
    stroke: "#7c3aed",
    fill: "transparent",
    strokeWidth: 8,
    text: ""
  });
});

test("parses canvas and edit commands", () => {
  assert.equal(parseCommandText("撤销").actions[0].type, "undo");
  assert.equal(parseCommandText("重做").actions[0].type, "redo");
  assert.equal(parseCommandText("清空画布").actions[0].type, "clear");
  assert.equal(parseCommandText("放大最后一个图形").actions[0].type, "resize-last");
  assert.equal(parseCommandText("向右移动最后一个图形").actions[0].direction, "right");
});

test("returns feedback for unsupported commands", () => {
  const result = parseCommandText("帮我做一个复杂动画");

  assert.deepEqual(result.actions, []);
  assert.match(result.feedback, /没有理解/);
});

