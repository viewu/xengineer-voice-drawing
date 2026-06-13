const COLORS = [
  { names: ["红", "红色", "red"], value: "#ef4444" },
  { names: ["蓝", "蓝色", "blue"], value: "#2563eb" },
  { names: ["绿", "绿色", "green"], value: "#16a34a" },
  { names: ["黄", "黄色", "yellow"], value: "#facc15" },
  { names: ["紫", "紫色", "purple"], value: "#7c3aed" },
  { names: ["黑", "黑色", "black"], value: "#111827" },
  { names: ["白", "白色", "white"], value: "#f8fafc" },
  { names: ["橙", "橙色", "orange"], value: "#f97316" }
];

const SHAPES = [
  { names: ["矩形", "方块", "长方形", "rectangle", "box"], value: "rectangle" },
  { names: ["圆", "圆形", "circle"], value: "circle" },
  { names: ["直线", "线", "线条", "line"], value: "line" },
  { names: ["箭头", "arrow"], value: "arrow" },
  { names: ["星星", "五角星", "star"], value: "star" },
  { names: ["文字", "文本", "text"], value: "text" }
];

const SPLIT_PATTERN = /(?:，|,|。|\.|\s+and\s+|\s+then\s+|然后|再|接着|并且)/i;

export function parseCommandText(text) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return unsupportedResult();
  }

  const segments = normalized.split(SPLIT_PATTERN).map((part) => part.trim()).filter(Boolean);
  const actions = segments.flatMap(parseSegment);

  if (actions.length === 0) {
    return unsupportedResult();
  }

  return {
    actions,
    feedback: `已识别 ${actions.length} 条语音绘图指令。`
  };
}

function parseSegment(segment) {
  const lower = segment.toLowerCase();

  if (hasAny(lower, ["撤销", "undo"])) return [{ type: "undo" }];
  if (hasAny(lower, ["重做", "redo"])) return [{ type: "redo" }];
  if (hasAny(lower, ["清空", "清除", "clear"])) return [{ type: "clear" }];
  if (hasAny(lower, ["导出", "下载", "保存", "export", "download"])) return [{ type: "export" }];

  const moveDirection = parseDirection(lower);
  if (moveDirection) return [{ type: "move-last", direction: moveDirection }];

  if (hasAny(lower, ["放大", "变大", "larger", "bigger", "grow"])) {
    return [{ type: "resize-last", scale: 1.2 }];
  }

  if (hasAny(lower, ["缩小", "变小", "smaller", "shrink"])) {
    return [{ type: "resize-last", scale: 0.82 }];
  }

  const shape = findMappedValue(lower, SHAPES);
  if (!shape) return [];

  const stroke = findMappedValue(lower, COLORS) ?? "#2563eb";
  const fill = parseFill(lower, stroke, shape);
  const strokeWidth = parseStrokeWidth(lower);
  const label = shape === "text" ? parseTextContent(segment) : "";

  return [{
    type: "add-shape",
    shape,
    stroke,
    fill,
    strokeWidth,
    text: label
  }];
}

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function unsupportedResult() {
  return {
    actions: [],
    feedback: "没有理解这条指令。你可以说：画一个红色圆形，然后添加一条蓝色箭头。"
  };
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function findMappedValue(text, mappings) {
  return mappings.find((item) => item.names.some((name) => text.includes(name)))?.value;
}

function parseFill(text, stroke, shape) {
  if (shape === "line" || shape === "arrow") return "transparent";
  if (hasAny(text, ["空心", "不填充", "outline", "transparent"])) return "transparent";
  if (hasAny(text, ["实心", "填充", "filled", "solid"])) return stroke;
  return "rgba(37, 99, 235, 0.12)";
}

function parseStrokeWidth(text) {
  if (hasAny(text, ["粗", "加粗", "thick", "bold"])) return 8;
  if (hasAny(text, ["细", "thin"])) return 2;
  return 4;
}

function parseDirection(text) {
  if (!hasAny(text, ["移动", "挪", "move"])) return null;
  if (hasAny(text, ["向右", "右", "right"])) return "right";
  if (hasAny(text, ["向左", "左", "left"])) return "left";
  if (hasAny(text, ["向上", "上", "up"])) return "up";
  if (hasAny(text, ["向下", "下", "down"])) return "down";
  return "right";
}

function parseTextContent(text) {
  const match = text.match(/(?:写上|文字|文本|text)\s*["“']?([^"”']+)["”']?/i);
  return match?.[1]?.trim() || "Voice";
}

