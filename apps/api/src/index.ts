import { log } from '@repo/logger'
import { createServer } from './server'

if (require.main === module) {
  const port = process.env.PORT || 5001
  const server = createServer()
  process.once('SIGUSR2', () => {
    log(`Received SIGUSR2 - attempting to stop server...`)
    server.close()
    process.kill(process.pid, 'SIGUSR2')
  })

  process.on('SIGINT', () => {
    log(`Received SIGINT - attempting to stop server...`)
    // this is only called on ctrl+c, not restart
    server.close()
    // process.kill(process.pid, 'SIGTERM')
    process.exit(0)
  })
  server.listen(port, () => {
    log(`api running on ${port}`)
  })
}