import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const deployScript = readFileSync('ops/deploy-release.sh', 'utf8')
const bootstrapScript = readFileSync('ops/server-bootstrap.sh', 'utf8')
const deployWorkflow = readFileSync('.github/workflows/deploy.yml', 'utf8')

describe('production persistence safeguards', () => {
  it('mounts media from shared storage instead of release storage', () => {
    expect(deployScript).toContain('MEDIA_DIR="$APP_ROOT/shared/media"')
    expect(deployScript).toContain('ln -s "$MEDIA_DIR" "$RELEASE_DIR/public/media"')
    expect(deployScript).toContain('Persistent media link is invalid')
    expect(deployScript).not.toContain('rm -rf "$MEDIA_DIR"')
    expect(deployWorkflow).toContain('Persistent media must not be included in the release archive.')
    expect(deployWorkflow).toContain('Verify persistent media mount')
  })

  it('does not re-enable the one-time production schema/seed flag on bootstrap reruns', () => {
    expect(bootstrapScript).toContain('PAYLOAD_DB_PUSH=true')
    expect(bootstrapScript).not.toContain("grep -q '^PAYLOAD_DB_PUSH='")
    expect(deployScript).toContain("sed -i '/^PAYLOAD_DB_PUSH=/d' \"$ENV_FILE\"")
    expect(deployScript).toContain('One-time production schema/seed flag must not remain enabled')
  })
})