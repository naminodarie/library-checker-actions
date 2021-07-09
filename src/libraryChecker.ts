import * as core from '@actions/core'
import {exec, getExecOutput, ExecOptions} from '@actions/exec'

export class LibraryChecker {
  private execOpts: ExecOptions

  constructor(libraryCheckerPath: string) {
    this.execOpts = {cwd: libraryCheckerPath}
  }

  /**
   * setup Library Checker
   */
  async setup(): Promise<void> {
    await core.group('setup Library Checker Problems', async () => {
      await exec(
        'pip3',
        ['install', '--user', '-r', 'requirements.txt'],
        this.execOpts
      )
      if (process.platform !== 'win32' && process.platform !== 'darwin') {
        await exec('prlimit', [
          '--stack=unlimited',
          '--pid',
          process.pid.toString()
        ]) // ulimit -s unlimited
      }
    })
  }

  async problems(): Promise<Problem[]> {
    const versions = await (async () => {
      const out = await getExecOutput(
        'python3',
        ['ci_generate.py', '--print-version'],
        {silent: true, ...this.execOpts}
      )
      return out.stdout
    })()
    return Object.entries(JSON.parse(versions)).map(t => ({
      name: t[0],
      version: t[1] as string
    }))
  }
}

export interface Problem {
  name: string
  version: string
}