import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDirectoryUrl = new URL('../dist/', import.meta.url)
const distDirectory = fileURLToPath(distDirectoryUrl)
const indexHtml = readFileSync(new URL('index.html', distDirectoryUrl), 'utf8')
const expectedBase = '/Shabi-s-AI-Academy/'
const expectedPublicUrl = 'https://shabilev.github.io/Shabi-s-AI-Academy'

const failures = []
const requireMatch = (pattern, message) => {
  if (!pattern.test(indexHtml)) failures.push(message)
}
const rejectMatch = (pattern, message) => {
  if (pattern.test(indexHtml)) failures.push(message)
}

requireMatch(new RegExp(`${expectedBase}assets/[^"']+\\.js`), 'hashed JavaScript asset does not use the repository base path')
requireMatch(new RegExp(`${expectedBase}assets/[^"']+\\.css`), 'hashed CSS asset does not use the repository base path')
requireMatch(new RegExp(`${expectedBase}favicon\\.svg`), 'favicon does not use the repository base path')
requireMatch(new RegExp(`${expectedBase}site\\.webmanifest`), 'manifest does not use the repository base path')
requireMatch(new RegExp(`rel="canonical" href="${expectedPublicUrl}/"`), 'canonical URL is not the GitHub Pages URL')
requireMatch(new RegExp(`property="og:url" content="${expectedPublicUrl}/"`), 'Open Graph URL is not the GitHub Pages URL')
rejectMatch(/\/src\/main\.tsx/, 'source entrypoint is present in built index.html')
rejectMatch(/localhost|127\.0\.0\.1/i, 'localhost reference is present in built index.html')

function textFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? textFiles(path) : ['.html', '.js', '.css', '.json', '.xml', '.txt', '.webmanifest'].includes(extname(path)) ? [path] : []
  })
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{20,}\b/,
]

for (const path of textFiles(distDirectory)) {
  const content = readFileSync(path, 'utf8')
  // Scan deployment HTML and the application entry chunk. React Router's vendor
  // fallback and curated educational examples contain inert localhost literals.
  const operationalAsset = extname(path) === '.html' || /^index-[^.]+\.js$/.test(basename(path))
  if (operationalAsset && /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(content)) failures.push(`localhost URL is present in ${path}`)
  if (secretPatterns.some((pattern) => pattern.test(content))) failures.push(`secret-shaped value is present in ${path}`)
}

if (failures.length) {
  console.error(`GitHub Pages build validation failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('GitHub Pages build validation passed: base path, hashed assets, metadata, and safety checks are correct.')
