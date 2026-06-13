import { parseCommandText } from "./commandParser.js";
import { applyAction, createInitialState } from "./drawingState.js";

const canvas = document.querySelector("#drawingCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const exportButton = document.querySelector("#exportButton");
const transcriptEl = document.querySelector("#transcript");
const historyList = document.querySelector("#historyList");
const statusDot = document.querySelector("#statusDot");
const statusTitle = document.querySelector("#statusTitle");
const statusText = document.querySelector("#statusText");
const shapeCount = document.querySelector("#shapeCount");

let state = createInitialState();
let recognition = null;
let listening = false;
let commandHistory = [];

initialize();

function initialize() {
  resizeCanvasForDisplay();
  render();
  setupSpeechRecognition();

  startButton.addEventListener("click", startListening);
  stopButton.addEventListener("click", stopListening);
  exportButton.addEventListener("click", exportCanvas);
  window.addEventListener("resize", () => {
    resizeCanvasForDisplay();
    render();
  });
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setStatus("当前浏览器不支持语音识别", "请使用 Chrome 或 Edge，并通过 localhost 打开应用。", "error");
    startButton.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    listening = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    setStatus("正在聆听", "请直接说出绘图指令。", "listening");
  };

  recognition.onend = () => {
    listening = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    setStatus("等待语音指令", "点击开始后继续绘图。", "idle");
  };

  recognition.onerror = (event) => {
    setStatus("语音识别遇到问题", event.error || "请检查麦克风权限。", "error");
  };

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript.trim();
    transcriptEl.textContent = text || "正在识别...";

    if (result.isFinal) {
      handleCommand(text);
    }
  };
}

function startListening() {
  if (!recognition || listening) return;
  try {
    recognition.start();
  } catch {
    setStatus("无法启动语音识别", "请稍等一秒后重试。", "error");
  }
}

function stopListening() {
  recognition?.stop();
}

function handleCommand(text) {
  const parsed = parseCommandText(text);
  if (parsed.actions.length === 0) {
    setStatus("需要换一种说法", parsed.feedback, "error");
    speak(parsed.feedback);
    addHistory(text, parsed.feedback);
    return;
  }

  const summaries = [];
  for (const action of parsed.actions) {
    if (action.type === "export") {
      exportCanvas();
      summaries.push("已导出画布");
      continue;
    }
    state = applyAction(state, action);
    summaries.push(summarizeAction(action));
  }

  render();
  const feedback = summaries.join("，");
  setStatus("指令已执行", feedback, "idle");
  speak(feedback);
  addHistory(text, feedback);
}

function render() {
  clearCanvas();
  drawGuide();
  for (const shape of state.shapes) {
    drawShape(shape);
  }
  shapeCount.textContent = `${state.shapes.length} 个元素`;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGuide() {
  ctx.save();
  ctx.strokeStyle = "rgba(37, 99, 235, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShape(shape) {
  ctx.save();
  ctx.lineWidth = shape.strokeWidth;
  ctx.strokeStyle = shape.stroke;
  ctx.fillStyle = shape.fill;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (shape.kind === "rectangle") drawRectangle(shape);
  if (shape.kind === "circle") drawCircle(shape);
  if (shape.kind === "line") drawLine(shape, false);
  if (shape.kind === "arrow") drawLine(shape, true);
  if (shape.kind === "star") drawStar(shape);
  if (shape.kind === "text") drawText(shape);

  ctx.restore();
}

function drawRectangle(shape) {
  ctx.beginPath();
  ctx.roundRect(shape.x - shape.width / 2, shape.y - shape.height / 2, shape.width, shape.height, 14);
  ctx.fill();
  ctx.stroke();
}

function drawCircle(shape) {
  ctx.beginPath();
  ctx.ellipse(shape.x, shape.y, shape.width / 2, shape.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawLine(shape, arrow) {
  const x1 = shape.x - shape.width / 2;
  const x2 = shape.x + shape.width / 2;
  const y = shape.y;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();

  if (!arrow) return;
  ctx.beginPath();
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - 20, y - 14);
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - 20, y + 14);
  ctx.stroke();
}

function drawStar(shape) {
  const spikes = 5;
  const outer = shape.width / 2;
  const inner = outer * 0.45;
  let rotation = Math.PI / 2 * 3;
  ctx.beginPath();
  ctx.moveTo(shape.x, shape.y - outer);
  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(shape.x + Math.cos(rotation) * outer, shape.y + Math.sin(rotation) * outer);
    rotation += Math.PI / spikes;
    ctx.lineTo(shape.x + Math.cos(rotation) * inner, shape.y + Math.sin(rotation) * inner);
    rotation += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawText(shape) {
  ctx.fillStyle = shape.stroke;
  ctx.font = "700 34px Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(shape.text || "Voice", shape.x, shape.y);
}

function resizeCanvasForDisplay() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(640, Math.round(rect.width * ratio));
  const height = Math.max(420, Math.round(rect.height * ratio));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function exportCanvas() {
  const link = document.createElement("a");
  link.download = "voice-drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function addHistory(command, feedback) {
  commandHistory = [{ command, feedback }, ...commandHistory].slice(0, 12);
  historyList.replaceChildren(...commandHistory.map((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.command} -> ${item.feedback}`;
    return li;
  }));
}

function setStatus(title, text, mode) {
  statusTitle.textContent = title;
  statusText.textContent = text;
  statusDot.classList.toggle("is-listening", mode === "listening");
  statusDot.classList.toggle("is-error", mode === "error");
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 1.05;
  window.speechSynthesis.speak(utterance);
}

function summarizeAction(action) {
  const shapeNames = {
    rectangle: "矩形",
    circle: "圆形",
    line: "线条",
    arrow: "箭头",
    star: "星星",
    text: "文字"
  };
  const actionNames = {
    undo: "已撤销",
    redo: "已重做",
    clear: "已清空画布",
    "move-last": "已移动最后一个图形",
    "resize-last": "已调整最后一个图形"
  };

  if (action.type === "add-shape") return `已添加${shapeNames[action.shape]}`;
  return actionNames[action.type] ?? "已执行";
}

