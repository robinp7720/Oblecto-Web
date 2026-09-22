import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { publishBuild } from '../scripts/build-web.mjs'

test('publishes a new entry point while retaining assets referenced by open tabs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'oblecto-web-publish-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const staging = join(root, 'staging')
  const web = join(root, 'web')
  await mkdir(join(staging, 'static'), { recursive: true })
  await mkdir(join(web, 'static'), { recursive: true })
  await writeFile(join(web, 'index.html'), '<script src="/web/static/old.js"></script>')
  await writeFile(join(web, 'static/old.js'), 'old')
  await writeFile(join(staging, 'index.html'), '<script src="/web/static/new.js"></script>')
  await writeFile(join(staging, 'static/new.js'), 'new')

  await publishBuild(staging, web)

  assert.match(await readFile(join(web, 'index.html'), 'utf8'), /new\.js/)
  assert.equal(await readFile(join(web, 'static/new.js'), 'utf8'), 'new')
  assert.equal(await readFile(join(web, 'static/old.js'), 'utf8'), 'old')
})

test('rejects incomplete output without replacing the active entry point', async t => {
  const root = await mkdtemp(join(tmpdir(), 'oblecto-web-publish-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const staging = join(root, 'staging')
  const web = join(root, 'web')
  await mkdir(staging)
  await mkdir(web)
  await writeFile(join(web, 'index.html'), 'active')

  await assert.rejects(publishBuild(staging, web), { code: 'ENOENT' })
  assert.equal(await readFile(join(web, 'index.html'), 'utf8'), 'active')
})
