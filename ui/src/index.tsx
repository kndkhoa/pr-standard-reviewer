import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// The dashboard host renders the default export as the page component. A `mount`
// function is also exported for hosts that call an explicit mount entry point.
export default App

export function mount(container: HTMLElement) {
  const root = createRoot(container)
  root.render(createElement(App))
  return () => root.unmount()
}
