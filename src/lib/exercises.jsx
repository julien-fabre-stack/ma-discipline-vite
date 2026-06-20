// ===== Illustrations d'exercices =====
// Mappe un nom d'exercice (saisi librement par l'utilisateur) vers le fichier
// image correspondant dans public/images/exercices/.
// Le mapping est volontairement large (synonymes, variantes, sans accents)
// car les noms d'exercices sont du texte libre, jamais une liste fermée.

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

  // Pompes
  if (n.includes('diamant')) return 'pompes-diamant.jpg'
  if (n.includes('pompe') || n.includes('push up') || n.includes('pushup')) {
    if ((n.includes('torse') || n.includes('buste')) && (n.includes('surelev') || n.includes('souleve'))) return 'pompes-torse-souleve.jpg'
    if ((n.includes('jambe') || n.includes('pied')) && (n.includes('surelev') || n.includes('souleve'))) return 'pompes-jambes-surelevees.jpg'
    return 'pompes-normales.jpg'
  }

  // Tractions
  if (n.includes('traction') || n.includes('pull up') || n.includes('pullup')) {
    if (n.includes('pronation')) return 'tractions-pronation.jpg'
    if (n.includes('supination')) return 'tractions-supination.jpg'
    if (n.includes('milieu') || n.includes('neutre')) return 'tractions-prise-milieu.jpg'
    return 'tractions-pronation.jpg'
  }

  // Burpees / remises debout
  if (n.includes('burpee')) return 'burpee-pompe.jpg'
  if (n.includes('remise debout') || (n.includes('remise') && n.includes('debout'))) return 'burpee-pompe.jpg'

  // Maker / kettlebell / haltere
  if (n.includes('maker') || n.includes('kettlebell') || n.includes('haltere') || n.includes('swing') || n.includes('clean')) return 'maker-press.jpg'

  // Coups (boxe / sac de frappe)
  if (n.includes('coup') || n.includes('frappe') || n.includes('boxe') || n.includes('esquive')) {
    if (n.includes('pied') || n.includes('kick')) return 'coups-de-pied.jpg'
    return 'coups-de-poing.jpg'
  }

  // Gainage / planche
  if (n.includes('gainage') || n.includes('planche') || n.includes('plank')) return 'gainage.jpg'

  // Abdos / roue
  if (n.includes('roue') || n.includes('ab wheel') || n.includes('abdo')) return 'roue-abdos.jpg'

  // Battle rope / corde lestee
  if (n.includes('battle') || (n.includes('corde') && !n.includes('saut'))) return 'battle-rope.jpg'

  // Jumping jack
  if (n.includes('jumping') || n.includes('jack') || n.includes('etoile')) return 'jumping-jack.jpg'

  // Squats
  if (n.includes('squat') || n.includes('flexion')) {
    if (n.includes('deep') || n.includes('profond') || n.includes('saute') || n.includes('jump')) return 'deep-squat.jpg'
    return 'squat.jpg'
  }

  // Wall sit / chaise
  if (n.includes('wall') || n.includes('chaise')) return 'wall-sit.jpg'

  // Mountain climbers
  if (n.includes('mountain') || n.includes('grimpeur')) return 'mountain-climbers.jpg'

  // Shoulder taps / epaule
  if (n.includes('shoulder') || (n.includes('epaule') && n.includes('tap'))) return 'shoulder-tap.jpg'

  // Bear crawl / quadrupedie
  if (n.includes('bear') || n.includes('ours') || n.includes('quadrup')) return 'bear-crawling.jpg'

  // Fentes
  if (n.includes('fente') || n.includes('lunge')) return 'squat.jpg'

  // Etirements / mobilite / stretching (le plus proche visuellement : gainage)
  if (n.includes('etirement') || n.includes('stretch') || n.includes('mobilite') || n.includes('papillon') || n.includes('grenouille') || n.includes('grand ecart') || n.includes('pince') || n.includes('hanche')) return 'gainage.jpg'

  // Course / cardio generique
  if (n.includes('course') || n.includes('run') || n.includes('sprint')) return 'jumping-jack.jpg'

  return null
}

export function exerciseImageSrc(name) {
  const f = exerciseImageFile(name)
  return f ? EX_IMG_BASE + f : null
}
