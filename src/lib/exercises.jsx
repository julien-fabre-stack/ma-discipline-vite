// ===== Illustrations d'exercices =====
// Mappe un nom d'exercice (saisi librement par l'utilisateur) vers le fichier
// image correspondant dans public/images/exercices/.

export const MUSCLE_GROUPS = [
  'Pectoraux', 'Dos', 'Epaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischio-jambiers', 'Fessiers',
  'Mollets', 'Avant-bras', 'Cardio', 'Autre'
]

export const DEFAULT_EXERCISES = [
  { nom: 'Developpe couche',    groupe: 'Pectoraux',  type: 'force' },
  { nom: 'Squat barre',         groupe: 'Quadriceps', type: 'force' },
  { nom: 'Souleve de terre',    groupe: 'Dos',        type: 'force' },
  { nom: 'Tractions',           groupe: 'Dos',        type: 'force' },
  { nom: 'Developpe militaire', groupe: 'Epaules',    type: 'force' },
  { nom: 'Curl barre',          groupe: 'Biceps',     type: 'force' },
  { nom: 'Dips',                groupe: 'Triceps',    type: 'force' },
  { nom: 'Leg press',           groupe: 'Quadriceps', type: 'force' },
  { nom: 'Rowing barre',        groupe: 'Dos',        type: 'force' },
  { nom: 'Hip thrust',          groupe: 'Fessiers',   type: 'force' },
  { nom: 'Planche',             groupe: 'Abdominaux', type: 'gainage' },
  { nom: 'Course a pied',       groupe: 'Cardio',     type: 'cardio' },
  { nom: 'Rameur',              groupe: 'Cardio',     type: 'cardio' },
  { nom: 'Corde a sauter',      groupe: 'Cardio',     type: 'cardio' },
]

const EX_IMG_BASE = '/images/exercices/'

const normEx = (s) => (s || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

// Renvoie le nom de fichier (sans base) correspondant au nom d'exercice, ou null.
export function exerciseImageFile(name) {
  const n = normEx(name)
  if (!n) return null

  if (n.includes('diamant')) return 'pompes-diamant.jpg'
  if (n.includes('pompe')) {
    if ((n.includes('torse') || n.includes('buste')) && n.includes('surelev')) return 'pompes-torse-souleve.jpg'
    if ((n.includes('jambe') || n.includes('pied')) && n.includes('surelev')) return 'pompes-jambes-surelevees.jpg'
    return 'pompes-normales.jpg'
  }
  if (n.includes('traction')) {
    if (n.includes('pronation')) return 'tractions-pronation.jpg'
    if (n.includes('supination')) return 'tractions-supination.jpg'
    if (n.includes('milieu') || n.includes('neutre')) return 'tractions-prise-milieu.jpg'
    return 'tractions-pronation.jpg'
  }
  if (n.includes('burpee')) return 'burpee-pompe.jpg'
  if (n.includes('maker')) return 'maker-press.jpg'
  if (n.includes('coup')) {
    if (n.includes('pied')) return 'coups-de-pied.jpg'
    if (n.includes('poing')) return 'coups-de-poing.jpg'
  }
  if (n.includes('gainage') || n.includes('planche')) return 'gainage.jpg'
  if (n.includes('roue')) return 'roue-abdos.jpg'
  if (n.includes('battle') || n.includes('corde')) return 'battle-rope.jpg'
  if (n.includes('jumping') || n.includes('jack')) return 'jumping-jack.jpg'
  if (n.includes('squat')) {
    if (n.includes('deep') || n.includes('profond')) return 'deep-squat.jpg'
    return 'squat.jpg'
  }
  if (n.includes('wall') || n.includes('chaise')) return 'wall-sit.jpg'
  if (n.includes('mountain')) return 'mountain-climbers.jpg'
  if (n.includes('shoulder') || n.includes('epaule')) return 'shoulder-tap.jpg'
  if (n.includes('bear') || n.includes('ours') || n.includes('quadrup')) return 'bear-crawling.jpg'

  return null
}

export function exerciseImageSrc(name) {
  const f = exerciseImageFile(name)
  return f ? EX_IMG_BASE + f : null
}
