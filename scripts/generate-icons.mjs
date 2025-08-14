import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

async function main() {
  const rootDir = path.resolve(process.cwd())
  const svgPath = path.join(rootDir, 'public', 'icons', 'nowandthen-icon.svg')
  const svg = await fs.readFile(svgPath, 'utf8')

  const sizes = [180, 167, 152, 120]
  await fs.mkdir(path.join(rootDir, 'public'), { recursive: true })

  for (const size of sizes) {
    const out = path.join(rootDir, 'public', size === 180 ? 'apple-touch-icon-180.png' : `apple-touch-icon-${size}.png`)
    const img = sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
    await img.toFile(out)
    console.log('wrote', out)
  }

  // Also write canonical apple-touch-icon.png (180x180) for iOS
  const canonicalOut = path.join(rootDir, 'public', 'apple-touch-icon.png')
  await sharp(Buffer.from(svg))
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(canonicalOut)
  console.log('wrote', canonicalOut)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


