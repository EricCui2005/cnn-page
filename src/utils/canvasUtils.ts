export function renderGrayscaleMap(
  ctx: CanvasRenderingContext2D,
  mapData: number[][],
  width: number,
  height: number
): void {
  // Basic validation
  if (
    !mapData ||
    mapData.length !== height ||
    !mapData[0] ||
    mapData[0].length !== width
  ) {
    console.error("Invalid map data provided to renderGrayscaleMap");
    // Optional: Clear the canvas or draw an error indicator
    ctx.clearRect(0, 0, width, height);
    return;
  }

  // Create ImageData for the canvas
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Fill the ImageData with grayscale values from the mapData
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = mapData[y][x];

      // Normalize value to 0-255 range
      // Ensure value is treated as a number before multiplication
      const numericValue = Number(value);
      const grayscale = Math.min(
        255,
        Math.max(0, Math.floor(numericValue * 255))
      );

      // Set RGBA values (all channels same for grayscale)
      const index = (y * width + x) * 4;
      data[index] = grayscale; // R
      data[index + 1] = grayscale; // G
      data[index + 2] = grayscale; // B
      data[index + 3] = 255; // A (fully opaque)
    }
  }

  // Put the ImageData onto the canvas
  ctx.putImageData(imageData, 0, 0);
}
