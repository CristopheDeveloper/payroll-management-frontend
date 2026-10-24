import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthLayout from '@/layouts/AuthLayout.vue'

describe('AuthLayout', () => {
  it('restarts the login view when the logo button is pressed', async () => {
    let mountCount = 0
    const RouterViewStub = defineComponent({
      template: '<span data-test="login-view">{{ instance }}</span>',
      setup() {
        mountCount += 1
        return { instance: mountCount }
      },
    })
    const wrapper = mount(AuthLayout, {
      global: {
        stubs: { RouterView: RouterViewStub },
      },
    })

    expect(wrapper.get('[data-test="login-view"]').text()).toBe('1')

    await wrapper.get('button[aria-label="Reiniciar formulario de inicio de sesión"]').trigger('click')

    expect(wrapper.get('[data-test="login-view"]').text()).toBe('2')
  })
})
