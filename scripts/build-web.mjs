import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { copyFile, lstat, mkdir, mkdtemp, readdir, rename, rm, unlink } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

async function filesIn (directory, prefix = '') {
  const files = []
  for (const entry of await readdir(join(directory, prefix), { withFileTypes: true })) {
    const relative = join(prefix, entry.name)
    if (entry.isDirectory()) files.push(...await filesIn(directory, relative))
    else if (entry.isFile()) files.push(relative)
    else throw new Error(`Unexpected build output: ${relative}`)
  }
  return files
}

async function publishFile (source, destination) {
  await mkdir(dirname(destination), { recursive: true })
  const temporary = `${destination}.${randomUUID()}.tmp`
  try {
    await copyFile(source, temporary)
    await rename(temporary, destination)
  } finally {
    await unlink(temporary).catch(error => {
      if (error.code !== 'ENOENT') throw error
    })
  }
}

/** Publish complete assets first, then switch the entry point in one rename. */
export async function publishBuild (stagingDirectory, webDirectory) {
  const index = join(stagingDirectory, 'index.html')
  if (!(await lstat(index)).isFile()) throw new Error('Build output has no index.html')
  const files = await filesIn(stagingDirectory)
  for (const relative of files) {
    if (relative !== 'index.html') {
      await publishFile(join(stagingDirectory, relative), join(webDirectory, relative))
    }
  }
  await publishFile(index, join(webDirectory, 'index.html'))
}

async function build () {
  const dist = resolve(process.env.OBLECTO_WEB_DIST_ROOT || join(projectRoot, 'dist'))
  await mkdir(dist, { recursive: true })
  const stagingDirectory = await mkdtemp(join(dist, '.web-build-'))
  try {
    const vite = join(projectRoot, 'node_modules/vite/bin/vite.js')
    const code = await new Promise((resolveExit, reject) => {
      const child = spawn(process.execPath, [vite, 'build', '--outDir', stagingDirectory], {
        cwd: projectRoot, stdio: 'inherit'
      })
      child.once('error', reject)
      child.once('close', resolveExit)
    })
    if (code !== 0) throw new Error(`Vite build failed (${code})`)
    await publishBuild(stagingDirectory, join(dist, 'web'))
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build()
}
