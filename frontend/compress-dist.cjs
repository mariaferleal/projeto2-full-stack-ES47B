const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const distDir = path.join(__dirname, 'dist')
const compressibleExtensions = new Set(['.html', '.js', '.css', '.svg', '.json'])

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return walk(fullPath)
    }

    return fullPath
  })
}

if (!fs.existsSync(distDir)) {
  throw new Error('Diretorio dist nao encontrado. Execute o build do Vite antes da compressao.')
}

for (const filePath of walk(distDir)) {
  const extension = path.extname(filePath)

  if (!compressibleExtensions.has(extension)) {
    continue
  }

  const content = fs.readFileSync(filePath)
  fs.writeFileSync(`${filePath}.gz`, zlib.gzipSync(content, { level: 9 }))
  fs.writeFileSync(`${filePath}.br`, zlib.brotliCompressSync(content))
}

console.log('Arquivos estaticos comprimidos com gzip e brotli.')
