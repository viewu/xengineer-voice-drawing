# AI Voice Drawing Tool Design

## Contest Track

Fourth batch, topic two: AI voice drawing tool.

The product is a browser-based drawing workspace controlled by spoken commands. The user should be able to create a simple visual composition without using mouse or keyboard during the demo.

## Product Scope

The MVP focuses on command understanding, drawing execution, error tolerance, and a clear demo flow.

Supported command families:

- Shape creation: rectangle, circle, line, arrow, text, star.
- Style changes: color, fill color, stroke width.
- Canvas operations: undo, redo, clear, export.
- Composition commands: move last shape, make last shape larger or smaller.
- Complex commands: split a sentence into multiple drawing actions when the user says "and", "then", "再", or "然后".

## Architecture

The app is a static web application with no build step.

- `src/commandParser.js` parses natural language command text into normalized drawing actions.
- `src/drawingState.js` owns immutable-ish drawing state operations: add shape, undo, redo, clear, update last shape, and export payload creation.
- `src/app.js` connects browser speech recognition, canvas rendering, voice synthesis feedback, and the UI.
- `tests/*.test.js` use Node's built-in test runner to verify parser and state behavior.

## Data Flow

Speech input becomes transcript text through the Web Speech API. The parser converts transcript text into a list of action objects. The app applies each action to drawing state, re-renders the canvas, and speaks a short result summary. Unsupported commands produce a friendly clarification instead of silently failing.

## Error Handling

If speech recognition is unavailable, the app shows a clear status and allows demo review through visible supported command examples. If a command cannot be parsed, the app keeps the current drawing unchanged and gives examples such as "画一个红色圆形" or "然后添加一条蓝色箭头".

## Cost Control Strategy

The default implementation runs command parsing locally in the browser and does not call a cloud model for every utterance. The design leaves a future extension point for LLM-assisted parsing only when the local parser cannot understand a command. This keeps latency low and reduces operating cost.

## Testing Strategy

Automated tests cover:

- Chinese and English command parsing.
- Complex command splitting.
- Style extraction.
- Undo and redo behavior.
- Last-shape updates.

Manual verification covers browser microphone permission, canvas rendering, voice feedback, and export behavior.

