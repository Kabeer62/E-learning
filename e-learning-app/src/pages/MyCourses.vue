<template>
  <div class="my-courses-list">
    <button @click="$emit('go-back')" class="back-button">
      ← Back
    </button>
    <h3>My Enrolled Courses</h3>

    <div v-if="myCourses.length === 0" class="empty-msg">
      <p>You haven't enrolled in any courses yet.</p>
    </div>

    <div v-else class="course-grid">
      <div class="course-card" v-for="(course, index) in myCourses" :key="index">
        <div class="image-container">
          <img :src="course.course.image" alt="Course Image" class="course-image" />
          <div class="play-button" @click="toggleVideo(index)">▶</div>
        </div>

        <div class="course-details">
          <h4 class="course-title">{{ course.course.title }}</h4>
          <p class="course-description">
            {{ course.course.description || 'No description available.' }}
          </p>
          <div class="user-meta">
            <p><strong>Name:</strong> {{ course.fullName || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ course.email || 'N/A' }}</p>
          </div>
        </div>

        <!-- Conditionally Render the Video -->
        <div v-if="playingVideoIndex === index" class="video-wrapper">
          <video controls preload="auto" width="100%" height="auto" :src="course.course.videoUrl"
            style="margin-top: 10px; border-radius: 12px;"></video>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'

const myCourses = ref([])
const playingVideoIndex = ref(null) // Track which course's video is playing

const fetchMyCourses = async () => {
  const email = localStorage.getItem('email')
  if (!email) return

  try {
    const res = await fetch(`http://localhost:5001/api/mycourses?email=${email}`)
    const data = await res.json()

    // For demonstration, if the course title is "Python for Data Science", assign a video URL.
    data.forEach(c => {
      if (c.course.title === "Python for Data Science" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/python.mp4";
      }
      if (c.course.title === "Full Stack Web Development" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/FullStack.mp4";
      }
      if (c.course.title === "Mastering ChatGPT & AI Prompts" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/ChatGPT.mp4";
      }
      if (c.course.title === "Introduction to Robotics & Automation" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/Robotics.mp4";
      }
      if (c.course.title === "Mobile App Development" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/MobileApp.mp4";
      }
      if (c.course.title === "Frontend with Vue.js" && !c.course.videoUrl) {
        c.course.videoUrl = "http://localhost:5001/videos/FrontendVue.js.mp4";
      }
    });

    myCourses.value = data
  } catch (err) {
    console.error('Failed to fetch courses:', err)
  }
}

const toggleVideo = (index) => {
  // Toggle video: if already playing, hide; else show selected one.
  playingVideoIndex.value = playingVideoIndex.value === index ? null : index
}

onMounted(() => {
  fetchMyCourses()
})
</script>

<style scoped>
.my-courses-list {
  padding: 30px;
  background: #f8fafc;
  min-height: 90vh;
}

.my-courses-list h3 {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  color: #222;
}

/* Force 3 items per row on medium to large screens */
.course-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  /* Default: 1 column for small screens */
  gap: 24px;
}

@media (min-width: 768px) {
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
    /* 3 columns on medium+ screens */
  }
}

.course-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  display: inline-block;
}

.course-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 12px 18px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.play-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.course-details {
  padding: 20px;
}

.course-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a202c;
}

.course-description {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 12px;
}

.user-meta {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  font-size: 0.95rem;
  color: #2d3748;
}

.user-meta p {
  margin: 4px 0;
}

.empty-msg {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  margin-top: 60px;
}

.back-button {
  position: fixed;

  display: flex;
  margin: 10px 0;
  background-color: #00bcd4;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.video-wrapper video {
  max-height: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>