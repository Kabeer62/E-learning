<template>
  <div class="auth-container">
    <div class="auth-box">
      <h2 class="auth-title">{{ isLogin ? 'Login to Your Account' : 'Create an Account' }}</h2>

      <!-- FORM -->
      <form @submit.prevent="handleAuth">
        <div v-if="isLogin">
          <input type="email" placeholder="Email" class="auth-input" v-model="email" required/>
          <input type="password" placeholder="Password" class="auth-input" v-model="password" required/>
          <button type="submit" class="auth-button">Login</button>
          <p class="switch-link">
            Don't have an account?
            <button type="button" @click="toggleForm">Register</button>
          </p>
        </div>

        <div v-else>
          <input type="text" placeholder="Full Name" class="auth-input" v-model="fullName" required pattern="^[A-Za-z\s]+$"
          title="Full name should contain only letters and spaces"/>
          <input type="email" placeholder="Email" class="auth-input" v-model="email" required/>
          <input type="password" placeholder="Password" class="auth-input" v-model="password" required/>
          <button type="submit" class="auth-button">Register</button>
          <p class="switch-link">
            Already have an account?
            <button type="button" @click="toggleForm">Login</button>
          </p>
        </div>
      </form>
      <!-- Button to switch to Admin Login -->
      <div class="admin-switch">
        <p>Are you an admin?</p>
        <button @click="goToAdminLogin">Go to Admin Login</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth'

const isLogin = ref(true)
const router = useRouter()

const email = ref('')
const password = ref('')
const fullName = ref('')

function toggleForm() {
  isLogin.value = !isLogin.value
}

function goToAdminLogin() {
  router.push('/admin-login');
}

// Combine both the logic into a single function
async function handleAuth() {
  if (!email.value.endsWith('@gmail.com')) {
    alert('Please enter a valid Gmail address.');
    return;
  }

  if (!email.value || !password.value || (!isLogin.value && !fullName.value)) {
    alert('Please fill all required fields.');
    return;
  }

  const payload = isLogin.value
    ? { email: email.value, password: password.value }
    : { fullName: fullName.value, email: email.value, password: password.value };

  const endpoint = isLogin.value ? '/login' : '/register';

  try {
    const response = await fetch(`http://localhost:5001${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    authState.isAuthenticated = true
    localStorage.setItem('email', data.email)
    localStorage.setItem('fullName', data.fullName)
    if (data.profileImage) {
      localStorage.setItem('profileImage', data.profileImage)
    } else {
      localStorage.removeItem('profileImage')
    }

    router.push('/');
  } catch (error) {
    alert('Server error: ' + error.message);
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
  background-size: cover;
  padding: 2.5rem 2rem 1rem;
  background-repeat: no-repeat;
  background-position: center;
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

.admin-switch {
  margin-top: 2rem;
  text-align: center;
  color: #000000;
}

.admin-switch button {
  margin-top: 0.5rem;
  background-color: whitesmoke;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-switch button:hover {
  background-color: #2563eb;
  color: white;
}
</style>