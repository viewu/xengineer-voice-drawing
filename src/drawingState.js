const DEFAULT_CANVAS = {
  width: 960,
  height: 600
};

const START_POSITIONS = [
  { x: 250, y: 180 },
  { x: 480, y: 180 },
  { x: 710, y: 180 },
  { x: 360, y: 360 },
  { x: 600, y: 360 }
];

export function createInitialState() {
  return {
    shapes: [],
    past: [],
    future: [],
    nextId: 1,
    canvas: { ...DEFAULT_CANVAS }
  };
}

export function applyAction(state, action) {
  switch (action.type) {
    case "add-shape":
      return commitState(state, [...state.shapes, createShape(action, state)]);
    case "undo":
      return undo(state);
    case "redo":
      return redo(state);
    case "clear":
      return commitState(state, []);
    case "move-last":
      return commitState(state, updateLastShape(state.shapes, (shape) => moveShape(shape, action.direction)));
    case "resize-last":
      return commitState(state, updateLastShape(state.shapes, (shape) => resizeShape(shape, action.scale)));
    default:
      return state;
  }
}

export function createShape(action, state) {
  const position = START_POSITIONS[(state.nextId - 1) % START_POSITIONS.length];
  const base = {
    id: `shape-${state.nextId}`,
    kind: action.shape,
    x: position.x,
    y: position.y,
    width: 160,
    height: 110,
    rotation: 0,
    stroke: action.stroke,
    fill: action.fill,
    strokeWidth: action.strokeWidth,
    text: action.text
  };

  if (action.shape === "circle") {
    return { ...base, width: 132, height: 132 };
  }

  if (action.shape === "line" || action.shape === "arrow") {
    return { ...base, width: 210, height: 0 };
  }

  if (action.shape === "star") {
    return { ...base, width: 140, height: 140 };
  }

  if (action.shape === "text") {
    return { ...base, width: 220, height: 60, fill: "transparent" };
  }

  return base;
}

function commitState(state, shapes) {
  return {
    ...state,
    shapes,
    past: [...state.past, state.shapes],
    future: [],
    nextId: shapes.length > state.shapes.length ? state.nextId + 1 : state.nextId
  };
}

function undo(state) {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return {
    ...state,
    shapes: previous,
    past: state.past.slice(0, -1),
    future: [state.shapes, ...state.future]
  };
}

function redo(state) {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  return {
    ...state,
    shapes: next,
    past: [...state.past, state.shapes],
    future: state.future.slice(1)
  };
}

function updateLastShape(shapes, updater) {
  if (shapes.length === 0) return shapes;
  return shapes.map((shape, index) => index === shapes.length - 1 ? updater(shape) : shape);
}

function moveShape(shape, direction) {
  const distance = 42;
  const delta = {
    right: { x: distance, y: 0 },
    left: { x: -distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance }
  }[direction] ?? { x: distance, y: 0 };

  return {
    ...shape,
    x: shape.x + delta.x,
    y: shape.y + delta.y
  };
}

function resizeShape(shape, scale) {
  return {
    ...shape,
    width: Math.max(24, Math.round(shape.width * scale)),
    height: Math.max(0, Math.round(shape.height * scale))
  };
}

