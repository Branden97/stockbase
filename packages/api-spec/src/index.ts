import * as fs from 'fs'
import { load } from 'js-yaml'
import { OpenAPIV3 } from 'openapi-types'
import * as path from 'path'

const filename = 'api-spec.yml'
export const apiSpecPath = path.join(__dirname, '../src/', filename)

export default load(fs.readFileSync(apiSpecPath).toString()) as OpenAPIV3.Document
