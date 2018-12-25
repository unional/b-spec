import { createLocalIO } from '@komondor-lab/io-local';
import { createServer } from '@komondor-lab/io-server';
import chalk from 'chalk';
import { CliCommand } from 'clibuilder';
import { LocalIOConfig } from '../config';
import { validate } from './validate';

export const serveCommand: CliCommand = {
  name: 'serve',
  description: 'Starts a local server to serve requests from client (browser)',
  async run() {
    const io = createLocalIO({ cwd: this.cwd })
    const config = await io.loadConfig() as LocalIOConfig

    if (validate({ ui: this.ui }, config, {
      localPort: {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 3000,
          lessThanOrEqualTo: 65535,
          message: 'must be between 3000 and 65535'
        }
      }
    })) {
      const server = createServer({ port: config.localPort })
      await server.start()

      this.ui.info(`komondor server started.`)
      this.ui.info(`--------------------------------------------------------------------------------`)
      this.ui.info(`      ${chalk.magenta(`${server.info.protocol}://localhost:${server.info.port}`)}`)
      this.ui.info(`--------------------------------------------------------------------------------`)
    }
  }
}
