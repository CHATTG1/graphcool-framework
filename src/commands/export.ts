import {SystemEnvironment} from '../types'
import {readProjectIdFromProjectFile} from '../utils/file'
import {
  noProjectIdMessage, exportingDataMessage, noProjectFileMessageFound,
  downloadUrlMessage
} from '../utils/constants'
import {exportProjectData, parseErrors, generateErrorOutput} from '../api/api'
const debug = require('debug')('graphcool')

interface Props {
  projectId?: string
}

export default async(props: Props, env: SystemEnvironment): Promise<void> => {
  const {resolver, out} = env

  debug(`Export for project Id: ${JSON.stringify(props)}`)

  try {
    const projectId = props.projectId ? props.projectId : readProjectIdFromProjectFile(resolver)

    debug(`Export for project Id: ${projectId}`)

    if (!projectId) {
      out.write(noProjectIdMessage)
      process.exit(0)
    }

    out.startSpinner(exportingDataMessage)
    const url = await exportProjectData(projectId!, resolver)

    const message = downloadUrlMessage(url)
    out.write(message)

  } catch(e) {
    out.stopSpinner()
    debug(`Received error: ${JSON.stringify(e)}`)
    //
    if (e.errors) {
      const errors = parseErrors(e)
      const output = generateErrorOutput(errors)

      out.write(`${output}`)
      process.exit(0)
    }

    out.write(noProjectFileMessageFound)
    process.exit(0)
  }

}