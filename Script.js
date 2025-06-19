/*
 * Licensed under the MIT License.
 */
const canvas = document.getElementById("mandelbrotCanvas");
const ctx = canvas.getContext("2d");
const iterationsInput = document.getElementById("iterations");
const zoomInput = document.getElementById("zoom");
const colorSchemeSelect = document.getElementById("colorScheme");
const invertColorsCheckbox = document.getElementById("invertColors");
const startAnimationButton = document.getElementById("startAnimation");
const stopAnimationButton = document.getElementById("stopAnimation");
const resetButton = document.getElementById("reset");
const toggleJuliaButton = document.getElementById("toggleJuliaButton");
const juliaCXInput = document.getElementById("juliaCX");
const juliaCYInput = document.getElementById("juliaCY");

let maxIterations = parseInt(iterationsInput.value);
let zoom = 1;
let offsetX = -0.5;
let offsetY = 0;
let colorScheme = colorSchemeSelect.value;
let invertColors = false;
let animationId;
let isAnimating = false;
let juliaMode = false;
let juliaC = {
    x: parseFloat(juliaCXInput.value),
    y: parseFloat(juliaCYInput.value)
};

// Variables for panning the view
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startOffsetX = 0;
let startOffsetY = 0;

// Initialize Web Worker only once with error handling
let worker;
try {
    worker = new Worker("mandelbrotWorker.js");
} catch (err) {
    console.error("Web Worker initialization failed:", err);
    const errorDiv = document.getElementById("workerError");
    if (errorDiv) {
        errorDiv.classList.remove("d-none");
    }
}

// Mouse-based panning controls
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        offsetX = startOffsetX - (deltaX * 4) / (zoom * canvas.width);
        offsetY = startOffsetY - (deltaY * 4) / (zoom * canvas.height);
        drawMandelbrotWithWorker();
    }
});

function endDrag() {
    if (isDragging) {
        isDragging = false;
    }
}

canvas.addEventListener("mouseup", endDrag);
canvas.addEventListener("mouseleave", endDrag);

function drawMandelbrotWithWorker() {
    if (!canvas || !ctx) {
        console.log("Canvas or context not found");
        return;
    }

    if (!worker) {
        console.error("Web Worker is not available.");
        return;
    }

    worker.postMessage({
        width: canvas.width,
        height: canvas.height,
        zoom: zoom,
        offsetX: offsetX,
        offsetY: offsetY,
        maxIterations: maxIterations,
        juliaMode: juliaMode,
        juliaC: juliaC,
        colorScheme: colorScheme,
        invertColors: invertColors
    });
}

// Set up worker response handling if worker initialized successfully
if (worker) {
    worker.addEventListener("message", (e) => {
        const { imageData } = e.data;
        const ctxImageData = new ImageData(new Uint8ClampedArray(imageData), canvas.width, canvas.height);
        ctx.putImageData(ctxImageData, 0, 0);
    });

    // Handle worker errors
    worker.addEventListener("error", (err) => {
        console.error("Web Worker error:", err);
    });
}

// Animation function
function animate() {
    if (isAnimating) {
        zoom *= 1.02; // Smoothly zoom in
        zoomInput.value = zoom;
        drawMandelbrotWithWorker();
        animationId = requestAnimationFrame(animate);
    }
}

function startAnimation() {
    if (!isAnimating) {
        isAnimating = true;
        zoomInput.value = zoom;
        animationId = requestAnimationFrame(animate);
        console.log("Animation started");
    }
}

function stopAnimation() {
    if (isAnimating) {
        isAnimating = false;
        cancelAnimationFrame(animationId);
        console.log("Animation stopped");
    }
}

// Event listeners
iterationsInput.addEventListener("input", () => {
    maxIterations = parseInt(iterationsInput.value);
    drawMandelbrotWithWorker();
});

zoomInput.addEventListener("input", () => {
    zoom = parseFloat(zoomInput.value);
    drawMandelbrotWithWorker();
});

colorSchemeSelect.addEventListener("change", () => {
    colorScheme = colorSchemeSelect.value;
    drawMandelbrotWithWorker();
});

invertColorsCheckbox.addEventListener("change", () => {
    invertColors = invertColorsCheckbox.checked;
    drawMandelbrotWithWorker();
});

juliaCXInput.addEventListener("input", () => {
    juliaC.x = parseFloat(juliaCXInput.value);
    drawMandelbrotWithWorker();
});

juliaCYInput.addEventListener("input", () => {
    juliaC.y = parseFloat(juliaCYInput.value);
    drawMandelbrotWithWorker();
});

toggleJuliaButton.addEventListener("click", () => {
    stopAnimation();
    juliaMode = !juliaMode;
    drawMandelbrotWithWorker();
});

resetButton.addEventListener("click", () => {
    stopAnimation();
    maxIterations = 200;
    zoom = 1;
    zoomInput.value = zoom;
    offsetX = -0.5;
    offsetY = 0;
    juliaMode = false;
    juliaCXInput.value = -0.7;
    juliaCYInput.value = 0.27015;
    juliaC.x = parseFloat(juliaCXInput.value);
    juliaC.y = parseFloat(juliaCYInput.value);
    drawMandelbrotWithWorker();
});

startAnimationButton.addEventListener("click", startAnimation);
stopAnimationButton.addEventListener("click", stopAnimation);

// Zoom in or out with the mouse wheel
canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoom *= factor;
    drawMandelbrotWithWorker();
});

// Initial draw
drawMandelbrotWithWorker();

// Handle canvas resizing
window.addEventListener("resize", () => {
    const { clientWidth, clientHeight } = canvas;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
    drawMandelbrotWithWorker();
});

// Set the initial canvas size based on the current client size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
