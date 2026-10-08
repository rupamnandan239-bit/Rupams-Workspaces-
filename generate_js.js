const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, 'frames');
const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));

// Sort files to ensure correct order
files.sort((a, b) => {
    const numA = parseInt(a.match(/frame_(\d+)/)[1]);
    const numB = parseInt(b.match(/frame_(\d+)/)[1]);
    return numA - numB;
});

const jsContent = `
const canvas = document.getElementById("scroll-canvas");
const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const frames = ${JSON.stringify(files)};
const frameCount = frames.length;

const images = [];
const preloadImages = () => {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = 'frames/' + frames[i];
    images.push(img);
  }
};

const drawImage = (img) => {
  if (!img) return;
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  const canvasRatio = canvas.width / canvas.height;
  const imgRatio = img.width / img.height;
  
  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
  } else {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
  }

  context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
};

// Wait for first image to load and draw it
const img = new Image();
img.src = 'frames/' + frames[0];
img.onload = () => {
    drawImage(img);
};

window.addEventListener('scroll', () => {  
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  
  requestAnimationFrame(() => drawImage(images[frameIndex]));
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
    if (images[frameIndex]) drawImage(images[frameIndex]);
});

preloadImages();
`;

fs.writeFileSync(path.join(__dirname, 'main.js'), jsContent);
console.log('main.js created successfully with ' + files.length + ' frames.');
