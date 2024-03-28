import { uploadBlobs } from '../blobs_upload/index.js'
import { type CoreStep, type CoreStepCondition } from '../types.js'

const condition: CoreStepCondition = async (...args) => {
  const {
    constants: { IS_LOCAL },
  } = args[0]
  return IS_LOCAL && ((await uploadBlobs.condition?.(...args)) ?? true)
}

export const devUploadBlobs: CoreStep = {
  event: 'onDev',
  coreStep: uploadBlobs.coreStep,
  coreStepId: 'dev_blobs_upload',
  coreStepName: 'Uploading blobs',
  coreStepDescription: () => 'Uploading blobs to development deploy store',
  condition,
}
