import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('application routes', () => {
  it('resolves the named login route through the layout and form records', () => {
    const loginRoute = router.resolve({ name: 'login' })

    expect(loginRoute.path).toBe('/login')
    expect(loginRoute.matched).toHaveLength(2)
    expect(loginRoute.matched.at(-1)?.name).toBe('login')
  })

  it('keeps home and users as independent top-level URLs', () => {
    expect(router.resolve({ name: 'home' }).path).toBe('/inicio')
    expect(router.resolve({ name: 'users' }).path).toBe('/usuarios')
  })

  it('redirects the previous nested users URL', () => {
    const legacyRoute = router.getRoutes().find((route) => route.path === '/inicio/usuarios')

    expect(legacyRoute?.redirect).toEqual({ name: 'users' })
  })
})
