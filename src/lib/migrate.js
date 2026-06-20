import { DEFAULT_PROFILE } from './defaults'

export function migrateProfile(raw = {}) {
  return {
    ...DEFAULT_PROFILE,
    ...raw,
    objectifProtG: raw.objectifProtG ?? DEFAULT_PROFILE.objectifProtG,
    objectifLipG:  raw.objectifLipG  ?? DEFAULT_PROFILE.objectifLipG,
    objectifGlucG: raw.objectifGlucG ?? DEFAULT_PROFILE.objectifGlucG,
  }
}
