import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
})