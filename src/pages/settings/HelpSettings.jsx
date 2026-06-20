import { useState } from 'react'
import Icon from '../../components/Icon'

const FAQ_ITEMS = [
  ['nav', "Comment l'app est organisée ?", "Des onglets en bas de l'écran : Séance (ta routine du jour, lanceur d'exercices et WOD), Nutrition (journal alimentaire et rapports), Suivi (frise/calendrier, habitudes, agenda) et Réglages."],
  ['seance', 'Comment fonctionne le lanceur de séance ?', "Touche « Démarrer » pour lancer ta séance du jour, exercice par exercice. Chaque étape affiche les répétitions à faire ou un minuteur de repos/temps. Si tu quittes en cours de route, « Reprendre » réapparaît pour continuer où tu en étais."],
  ['wod', 'Comment ajouter ou modifier un WOD ?', "Réglages → Training → WOD. Tu peux créer un WOD à la main, ou coller un texte au format « Nom | minutes » suivi d'une ligne par exercice avec le nombre de répétitions — il sera importé automatiquement."],
  ['sport', 'Comment marquer ma séance comme faite ?', "Le bouton « Marquer Sport fait » dans l'onglet Séance, ou automatiquement à la fin du lanceur ou du WOD. Ça coche l'habitude « Sport » du jour, visible dans Suivi."],
  ['nutrition', 'Comment fonctionne le journal alimentaire ?', "Dans l'onglet Nutrition, touche le + sur un repas pour ajouter un aliment (ta bibliothèque, recherche Ciqual, ou création manuelle). Les totaux du jour et de chaque repas s'affichent en haut."],
  ['objectifs', "Comment régler mes objectifs caloriques et d'eau ?", "Réglages → Nutrition : un objectif de calories différent selon le type de jour (séance, récupération, repos), plus un objectif d'eau quotidien."],
  ['frise', 'Comment lire la frise dans Suivi ?', "Chaque ligne représente un jour. Le liseré coloré à gauche indique le statut du cycle d'entraînement (vert = semaine active, gris = semaine off). À droite, les liserés correspondent à tes catégories de « Périodes »."],
  ['legende', 'À quoi sert la légende en haut de Suivi ?', "Les chips Statuts / Cycle / Périodes / RDV sont cliquables : touche-en une pour faire défiler la frise jusqu'à la prochaine occurrence correspondante."],
  ['jour', 'À quoi sert le panneau du jour ?', "En touchant un jour dans la frise, le panneau affiche : Habitudes (cases à cocher), Rendez-vous, À faire, et une Note libre — chaque section est repliable."],
  ['rdv', 'Comment fonctionnent les catégories de RDV ?', "Réglages → Tableau de bord → Catégories RDV : crée des catégories avec une couleur et un nom. Quand tu ajoutes un rendez-vous, choisis une catégorie."],
  ['cycle', "Comment fonctionne le cycle d'entraînement ?", "Par défaut, le cycle suit un rythme de 9 semaines (8 actives puis 1 de décharge) à partir de ta date de départ. Tu peux aussi définir manuellement des périodes « actif »/« off » dans Réglages → Tableau de bord → Agenda."],
  ['theme', "Comment changer l'apparence de l'app ?", "Réglages → Apparence : choix du thème (Aube, Nuit, Ardoise, Aurore, Forêt…), couleur d'accent personnalisée, et transparence de la barre de navigation."],
  ['horsligne', "L'app fonctionne sans connexion internet ?", "Tes données sont mises en cache sur l'appareil : si la connexion coupe, tu peux continuer à consulter et modifier, et tout se synchronise au retour du réseau. Le tout premier chargement nécessite toujours internet."],
  ['sauvegarde', 'Comment sauvegarder mes données ?', "Réglages → Data opérateur → « Exporter mes données » télécharge un fichier JSON contenant tout ton historique (séances, repas, habitudes, agenda)."],
]

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="rounded-2xl mb-2 overflow-hidden bg-surface border border-line">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left">
        <span className="text-sm font-semibold">{q}</span>
        <Icon name="down" size={16} className="text-muted flex-shrink-0" style={{ transition: 'transform 280ms ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 300ms cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ minHeight: 0, overflow: 'hidden' }}>
          <div className="px-4 pb-3 text-sm text-muted leading-relaxed">{a}</div>
        </div>
      </div>
    </div>
  )
}

export default function HelpSettings() {
  const [open, setOpen] = useState({})
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }))
  return (
    <div>
      <div className="text-sm mb-4 text-muted">Petit guide de l'app — touche une question pour dérouler la réponse.</div>
      {FAQ_ITEMS.map(([k, q, a]) => (<FaqItem key={k} q={q} a={a} open={!!open[k]} onToggle={() => toggle(k)} />))}
    </div>
  )
}
