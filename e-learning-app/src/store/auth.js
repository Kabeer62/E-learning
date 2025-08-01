import { reactive } from 'vue'

export const authState = reactive({
  isAuthenticated: !!localStorage.getItem('email')
})

export const login = (email) => {
  localStorage.setItem('email', email)
  authState.isAuthenticated = true
}

export const logout = () => {
  localStorage.removeItem('email')
  authState.isAuthenticated = false
}