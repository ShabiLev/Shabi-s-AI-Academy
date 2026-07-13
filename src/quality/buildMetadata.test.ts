import { describe, expect, it } from 'vitest'
import { resolveBuildMetadata } from './buildMetadata'

describe('resolveBuildMetadata', () => {
  it('falls back safely when nothing was injected', () => {
    expect(resolveBuildMetadata({})).toEqual({
      version: 'local',
      commitSha: 'local',
      branch: 'unknown',
      buildTimestamp: 'not available',
      deploymentEnvironment: 'local',
      publicSiteUrl: 'https://shabi-s-ai-academy.vercel.app',
    })
  })

  it('passes through injected values untouched', () => {
    expect(
      resolveBuildMetadata({
        version: '0.5.0',
        commitSha: 'abc1234',
        branch: 'main',
        buildTimestamp: '2026-07-11T00:00:00.000Z',
        deploymentEnvironment: 'preview',
        publicSiteUrl: 'https://preview.example.test',
      }),
    ).toEqual({
      version: '0.5.0',
      commitSha: 'abc1234',
      branch: 'main',
      buildTimestamp: '2026-07-11T00:00:00.000Z',
      deploymentEnvironment: 'preview',
      publicSiteUrl: 'https://preview.example.test',
    })
  })

  it('never reads or renders anything beyond the six explicit safe fields', () => {
    const result = resolveBuildMetadata({ version: '0.5.0' })
    expect(Object.keys(result).sort()).toEqual([
      'branch',
      'buildTimestamp',
      'commitSha',
      'deploymentEnvironment',
      'publicSiteUrl',
      'version',
    ])
  })

  it('treats an empty string the same as missing', () => {
    expect(resolveBuildMetadata({ version: '' }).version).toBe('local')
  })
})
