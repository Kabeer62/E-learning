<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">Admin Login</h2>

      <!-- Login Form -->
      <form @submit.prevent="handleAdminLogin">
        <input type="email" placeholder="Admin Email" class="auth-input" v-model="email" required />
        <input type="password" placeholder="Password" class="auth-input" v-model="password" required />
        <button type="submit" class="auth-button">Login</button>

        <!-- Link to User Login -->
        <div class="switch-link">
          <p>Not an admin?</p>
          <button @click="goToUserLogin">Go to User Login</button>
        </div>
      </form>
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

function goToUserLogin() {
  router.push('/login');
}

async function handleAdminLogin() {
  try {
    const response = await fetch('http://localhost:5001/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    // Save user data for dashboard
    localStorage.setItem('email', email.value)
    localStorage.setItem('isAdmin', 'true')
    localStorage.setItem('fullName', data.fullName || 'Admin')
    localStorage.setItem('profileImage', data.profileImage || null)

    router.push('/admin-home')
  } catch (error) {
    alert('Admin login failed: ' + error.message)
  }
}
</script>
  
<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 95vh;
  background-image: url('../assets/images/login-background.avif');
  background-size: cover;
  padding: 2rem;
}

.auth-box {
  background: rgba(255, 255, 255, 0.627);
  padding: 2.5rem 2rem 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  color: white;
}

.auth-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5rem;
  margin-top: -1rem;
  text-align: center;
  color: #000000b3;
}

.auth-input {
  width: 93%;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border: none;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.752);
  color: #111827;
  font-size: 1rem;
}

.auth-input::placeholder {
  color: #6b7280;
}

.auth-button {
  width: 90%;
  background-color: #2563eb;
  margin-left: 1rem;
  margin-top: 1rem;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #1e40af;
}

.switch-link {
  margin-top: 2rem;
  font-size: 0.95rem;
  color: #000000;
  text-align: center;
}

.switch-link button {
  background: none;
  border: none;
  color: #0073ff;
  cursor: pointer;
  font-weight: 500;
  margin-left: 0.3rem;
  transition: color 0.3s ease;
}

.switch-link button:hover {
  color: #0052b0;
  text-decoration: underline;
}
</style>