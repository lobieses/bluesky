import * as url from 'url'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as prettier from 'prettier'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const labelsDef = JSON.parse(
  readFileSync(
    join(__dirname, '..', '..', 'definitions', 'labels.json'),
    'utf8',
  ),
)
const labelGroupsEn = JSON.parse(
  readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'definitions',
      'locale',
      'en',
      'label-groups.json',
    ),
    'utf8',
  ),
)

writeFileSync(
  join(__dirname, '..', '..', 'src', 'moderation', 'const', 'label-groups.ts'),
  await gen(),
  'utf8',
)

async function gen() {
  return prettier.format(
    `/** this doc is generated by ./scripts/code/labels.mjs **/
  import {LabelGroupDefinitionMap} from '../types'
  import {LABELS} from './labels'

  export const LABEL_GROUPS: LabelGroupDefinitionMap = {
    ${genDefMap()}
  }
  `,
    { semi: false, parser: 'babel', singleQuote: true },
  )
}

function genDefMap() {
  const lines = []
  for (const group of labelsDef) {
    lines.push(`"${group.id}": {`)
    lines.push(`  id: "${group.id}",`)
    lines.push(`  configurable: ${group.configurable ? true : false},`)
    lines.push(
      `  labels: [${group.labels
        .map((label) => `LABELS["${label.id}"]`)
        .join(', ')}],`,
    )
    lines.push(
      `  strings: {settings: {en: ${JSON.stringify(labelGroupsEn[group.id])}}}`,
    )
    lines.push(`},`)
  }
  return lines.join('\n')
}

export {}
