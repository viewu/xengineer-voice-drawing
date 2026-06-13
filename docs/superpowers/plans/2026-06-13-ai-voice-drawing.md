# AI Voice Drawing Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static browser app that lets users draw by voice and submit it as a contest-ready MVP.

**Architecture:** Pure command parsing and drawing state live in testable ES modules. Browser integration handles speech recognition, canvas rendering, command history, spoken feedback, and export.

**Tech Stack:** Vanilla HTML, CSS, JavaScript ES modules, Canvas 2D API, Web Speech API, Node built-in test runner.

---

### Task 1: Test Parser Behavior

**Files:**
- Create: `tests/commandParser.test.js`
- Later create: `src/commandParser.js`

- [ ] Write tests for basic shape parsing, style parsing, unsupported commands, and complex command splitting.
- [ ] Run `node --test tests/commandParser.test.js` and confirm it fails because `src/commandParser.js` does not exist.

### Task 2: Implement Parser

**Files:**
- Create: `src/commandParser.js`

- [ ] Implement `parseCommandText(text)` returning `{ actions, feedback }`.
- [ ] Support rectangle, circle, line, arrow, star, text, color, fill, stroke width, undo, redo, clear, export, move, grow, and shrink.
- [ ] Run `node --test tests/commandParser.test.js` and confirm it passes.

### Task 3: Test Drawing State

**Files:**
- Create: `tests/drawingState.test.js`
- Later create: `src/drawingState.js`

- [ ] Write tests for add shape, undo, redo, clear, and update last shape.
- [ ] Run `node --test tests/drawingState.test.js` and confirm it fails because `src/drawingState.js` does not exist.

### Task 4: Implement Drawing State

**Files:**
- Create: `src/drawingState.js`

- [ ] Implement `createInitialState`, `applyAction`, and `createShape`.
- [ ] Keep state serializable and predictable.
- [ ] Run `node --test` and confirm all tests pass.

### Task 5: Build Browser App

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`

- [ ] Render a canvas, transcript panel, command history, status, and supported examples.
- [ ] Connect speech recognition start/stop controls.
- [ ] Apply parsed actions and re-render the canvas.
- [ ] Add export to PNG and voice feedback.

### Task 6: Contest Documentation

**Files:**
- Create or update: `README.md`
- Create: `docs/design.md`
- Create: `docs/demo-script.md`

- [ ] Document selected topic, features, run steps, dependencies, demo video placeholder, design document link, and originality notes.
- [ ] Include planned commands, implemented commands, and unfinished items.
- [ ] Include a 2-minute demo script.

### Task 7: Verification

**Files:**
- Existing project files.

- [ ] Run `node --test`.
- [ ] Start a local static server.
- [ ] Open the app locally and verify core UI loads.
- [ ] Report exact verification results and any gaps.

