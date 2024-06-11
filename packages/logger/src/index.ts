function baseLogger(...args: unknown[]): void {
  // eslint-disable-next-line no-console -- logger
  console.log('LOGGER: ', ...args)
}

// log, warn, and error functions (warn and error don't log in `test` environment):
export function log(...args: unknown[]): void {
  baseLogger('[LOG]:', ...args)
}

export function warn(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'testt') {
    baseLogger('[WARN]:', ...args)
  }
}

export function error(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'testt') {
    baseLogger('[ERROR]:', ...args)
  }
}
