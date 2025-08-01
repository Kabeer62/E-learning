<template>
  <div class="container">
    <button class="back-btn" @click="$emit('go-back')">
      ←</button>

    <h1 class="title">Registered Users</h1>

    <div v-if="users.length" class="user-grid">
      <div v-for="user in users" :key="user._id" class="user-card">
        <img v-if="user.profileImage" :src="user.profileImage" alt="Profile Image" class="profile-img" />
        <h2 class="user-name">{{ user.fullName }}</h2>
        <p class="user-email">{{ user.email }}</p>

        <hr class="user-divider" />

        <div v-if="user.courses && user.courses.length" class="user-courses">
          <h3>Enrolled Courses:</h3>
          <div class="course-list">
            <div v-for="(course, index) in user.courses" :key="index">
              <div class="course-item">
                <img :src="course.image" alt="Course Image" class="course-img" />
                {{ course.title }}
              </div>
              <hr v-if="index < user.courses.length - 1" class="user-divider" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="no-users">No users found.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const users = ref([])
const router = useRouter()

function goHome() {
  router.push('/')
}

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5001/api/users-with-courses')
    users.value = response.data
  } catch (err) {
    console.error('Failed to fetch users:', err)
  }
})
</script>

<style scoped>
.container {
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-align: center;
}

.user-grid {
  display: grid;
  gap: 3rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.user-card {
  background-color: #fff;
  border-radius: 0.75rem;
  width: 18.3rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.user-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.profile-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid #ddd;
}

.user-name {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  text-align: center;
}

.user-email {
  color: #555;
  font-size: 0.875rem;
}

.no-users {
  text-align: center;
  color: #999;
}

.back-btn {
  background-color: #f3f3f3;
  border: none;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: Arial, sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: #000000;
  color: white;
}

.user-courses {
  margin-top: 1rem;
  text-align: left;
}

.user-courses h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.user-courses ul {
  list-style-type: disc;
  padding-left: 1.2rem;
}

.user-courses li {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.course-img {
  width: 24px;
  height: 24px;
  object-fit: cover;
  margin-right: 0.5rem;
  border-radius: 4px;
}

.user-divider {
  margin: 8px 0;
  border: none;
  border-top: 1px solid #ccc;
}
</style>