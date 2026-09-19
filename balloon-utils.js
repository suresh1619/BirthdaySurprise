const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function getTextPoints(text) {
  setCanvasSize();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";

  const fontSize = Math.max(60, Math.min(canvas.width / 10, 130));
  ctx.font = `900 ${fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = Array.isArray(text) ? text : String(text).split("\n");
  const lineHeight = fontSize * 1.0;
  const totalHeight = lineHeight * lines.length;
  const centerY = canvas.height / 2 - (totalHeight - lineHeight) / 2;

  lines.forEach((line, i) => {
    const y = centerY + i * lineHeight;
    ctx.fillText(line, canvas.width / 2, y);
  });

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const points = [];

  const step = 4;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
