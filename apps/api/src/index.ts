import http from 'node:http'
import { log } from '@repo/logger'
import { createServer } from './server'

if (require.main === module) {
  const port = process.env.PORT || 5001
  const expressServer = createServer()
  const httpServer = http.createServer(expressServer)
  process.once('SIGUSR2', () => {
    log(`Received SIGUSR2 - attempting to stop server...`)
    httpServer.close()
    process.kill(process.pid, 'SIGUSR2')
  })

  process.on('SIGINT', () => {
    log(`Received SIGINT - attempting to stop server...`)
    // this is only called on ctrl+c, not restart
    httpServer.close()
    // process.kill(process.pid, 'SIGTERM')
    process.exit(0)
  })
  httpServer.listen(port, () => {
    log(`api running on ${port}`)
  })
}
