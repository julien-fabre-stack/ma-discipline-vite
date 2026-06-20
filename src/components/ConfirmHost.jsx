import { useState, useCallback } from 'react'
import { Modal, Button } from './UI'

let _resolve = null

export function ConfirmHost() {
  const [state, setState] = useState({ open: false, message: '', title: 'Confirmer' })

  if (typeof window !== 'undefined') {
    window.__confirmDialog = useCallback((message, title = 'Confirmer') => {
      return new Promise(resolve => {
        _resolve = resolve
        setState({ open: true, message, title })
      })
    }, [])
  }

  const handle = (result) => {
    setState(s => ({ ...s, open: false }))
    if (_resolve) { _resolve(result); _resolve = null }
  }

  return (
    <Modal open={state.open} onClose={() => handle(false)} title={state.title}>
      <p className="text-muted mb-6">{state.message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={() => handle(false)}>Annuler</Button>
        <Button variant="danger" onClick={() => handle(true)}>Confirmer</Button>
      </div>
    </Modal>
  )
}

export async function confirm(message, title) {
  if (window.__confirmDialog) return window.__confirmDialog(message, title)
  return window.confirm(message)
}
