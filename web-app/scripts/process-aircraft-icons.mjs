/**
 * Script to process aircraft icons for map markers
 * - Removes semi-transparent background noise
 * - Extracts only the gold/amber aircraft silhouette
 * - Creates SQUARE images for proper rotation on map
 * - Resizes to appropriate size for map markers
 * - Generates multiple sizes for different zoom levels
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename } from 'path';

// Source images from downloads folder (original high-res PNGs)
const INPUT_DIR = 'C:/Users/samso/Downloads/plot_planes';
const OUTPUT_DIR = './public/aircraft/optimized';

// Map marker sizes - we'll generate multiple for different zoom levels
// All markers will be SQUARE for proper rotation
const SIZES = [
  { name: 'sm', size: 32 },   // Low zoom
  { name: 'md', size: 48 },   // Medium zoom (default)
  { name: 'lg', size: 64 },   // High zoom
];

async function processImage(inputPath, outputDir) {
  const filename = basename(inputPath, '.png');
  console.log(`Processing ${filename}...`);

  try {
    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  Original: ${metadata.width}x${metadata.height}`);

    // Get raw pixel data with alpha
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Process pixels: keep only gold-colored pixels, make everything else transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Gold/amber aircraft: R > 180, G between 140-210, B < 100
      // Also the aircraft has high alpha values
      const isGold = r > 170 && g > 130 && g < 220 && b < 120 && a > 100;

      // Keep darker gold shading too (shadows on aircraft)
      const isDarkGold = r > 120 && g > 90 && g < r && b < 80 && a > 150;

      if (isGold || isDarkGold) {
        // Keep pixel, ensure full opacity
        data[i + 3] = 255;
      } else {
        // Make transparent
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }

    // Create image from processed data
    const processed = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer();

    // Trim transparent edges
    const trimmed = await sharp(processed)
      .trim({ threshold: 1 })
      .toBuffer();

    const trimmedMeta = await sharp(trimmed).metadata();
    console.log(`  Cleaned & trimmed: ${trimmedMeta.width}x${trimmedMeta.height}`);

    // Generate each size as SQUARE with aircraft centered
    for (const { name, size } of SIZES) {
      const outputPath = join(outputDir, `${filename}-${name}.png`);

      await sharp(trimmed)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`  Created ${name}: ${size}x${size}`);
    }

    // Also create a default size (medium) with standard name
    const defaultPath = join(outputDir, `${filename}.png`);
    const defaultSize = 48;

    await sharp(trimmed)
      .resize(defaultSize, defaultSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9 })
      .toFile(defaultPath);

    console.log(`  Created default: ${defaultSize}x${defaultSize}`);

  } catch (error) {
    console.error(`  Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('Aircraft Icon Processor\n');

  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Get all PNG files in input directory (excluding subdirectories)
  const files = await readdir(INPUT_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('-sm') && !f.includes('-md') && !f.includes('-lg'));

  console.log(`Found ${pngFiles.length} aircraft images to process\n`);

  for (const file of pngFiles) {
    await processImage(join(INPUT_DIR, file), OUTPUT_DIR);
    console.log('');
  }

  console.log('Done! Optimized icons are in:', OUTPUT_DIR);
}

main().catch(console.error);
