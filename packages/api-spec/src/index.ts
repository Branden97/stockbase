import { load } from 'js-yaml'
import * as path from 'path'
import * as fs from 'fs'
import { OpenAPIV3 } from 'openapi-types'

const filename = 'api-spec.yml'
export const apiSpecPath = path.join(__dirname, filename)

export default load(
  fs.readFileSync(apiSpecPath).toString()
) as OpenAPIV3.Document
