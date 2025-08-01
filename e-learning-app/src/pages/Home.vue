<template>
  <div>
    <MyCourses v-if="showMyCoursesPage" @go-back="showMyCoursesPage = false" />
    <Users v-if="showUsersPage" @go-back="showUsersPage = false" />
    <div v-if="!showMyCoursesPage && !showUsersPage">


      <!-- Main Content -->
      <div :class="['course-detail-page', { 'slide-in': isEnrolling }]">
        <div class="course-detail-container" v-if="selectedCourse">

          <!-- Close Button -->
          <button class="close-btn" @click="closeEnrollment">✕</button>

          <img :src="selectedCourse.image" :alt="selectedCourse.title" class="course-detail-image" />
          <div class="course-detail-info">
            <h2>{{ selectedCourse.title }}</h2>
            <p class="course-description">
              {{ selectedCourse.fullDescription || selectedCourse.description }}
            </p>
            <button class="enroll-button" @click="enrollNow">Enroll Now</button>
          </div>
        </div>
      </div>

      <!-- Navbar -->
      <div :class="['main-content-wrapper', { blurred: isEnrolling }]">
        <nav class="navbar">
          <div class="brand">
            <img :src="icon" alt="Icon" style="width: 50px; height: 50px;" />
          </div>

          <div class="nav-buttons">
            <button class="premium-btn" @click="showPremiumModal = true">
              <i class="fas fa-star"></i> Premium
            </button>
            <div class="notification-icon" @click="openNotifications">
              <i class="fas fa-bell"></i>
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
            </div>
          </div>

          <div class="profile-wrapper">
            <label class="dashboard-btn" @click="toggleDashboard">
              <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-pic" />
              <i v-else class="fas fa-user"></i>
            </label>
            <label v-if="!profileImage" class="upload-plus-btn" for="profileUpload">
              <i class="fas fa-plus"></i>
            </label>
            <input type="file" id="profileUpload" @change="handleProfileUpload" accept="image/*" hidden />
          </div>
        </nav>

        <div v-if="showPremiumModal" class="modal-overlay" @click.self="showPremiumModal = false">
          <div class="modal-content">
            <h2>Unlock Premium Access</h2>
            <p>Gain access to exclusive courses, content, and features by upgrading to Premium.</p>
            <button class="modal-upgrade" @click="upgradeNow">Upgrade Now</button>
            <button type="button" class="modal-cancel" @click="showPremiumModal = false">Cancel</button>
          </div>
        </div>

        <!-- Dashboard -->

        <div :class="['dashboard-container', { hidden: !isDashboardVisible }]">
          <div class="container">
            <div class="bubbles">
              <span v-for="i in 45" :key="i" :style="{ '--i': Math.floor(Math.random() * 20) + 10 }"></span>
            </div>
          </div>

          <div class="user-info">
            <img v-if="profileImage" :src="profileImage" alt="User Image" class="dashboard-profile-img" />
            <i v-else class="fas fa-user-circle default-user-icon"></i>
            <p class="user-name">{{ userName }}</p>
          </div>

          <hr class="user-divider" />

          <label class="edit-profile-label" for="editProfileInput">
            <i class="fas fa-edit"></i> Edit Profile
          </label>
          <input type="file" id="editProfileInput" @change="handleProfileUpload" accept="image/*" hidden />

          <button v-if="isAdmin" class="users-button" @click="fetchUsers">
            <i class="fas fa-users"></i>
            <span>Users</span>
          </button>

          <button v-if="!isAdmin" class="users-button" @click="handleMyCourses">
            <i class="fas fa-book"></i>
            <span>My Courses</span>
          </button>

          <button class="logout-button" @click="logout">
            <span>Logout</span>
            <i></i>
          </button>
        </div>

        <div v-if="myCourses.length > 0" class="my-courses-list">
          <h3>My Enrolled Courses</h3>
          <div class="course-card" v-for="(course, index) in myCourses" :key="index">
            <img :src="course.course.image" alt="Course Image" class="course-image" />

            <div class="course-details">
              <h4 class="course-title">{{ course.course.title }}</h4>
              <p class="course-description">{{ course.course.description || 'No description available.' }}</p>

              <div class="user-meta">
                <p><strong>User:</strong> {{ course.username || 'N/A' }}</p>
                <p><strong>Email:</strong> {{ course.email || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>



        <!-- Hero Banner -->
        <div class="home-banner">
          <div class="home-container">
            <img :src="heroImage" alt="Learning background" class="hero-image animate-image" />
            <div class="overlay-text">
              <svg viewBox="0 0 600 300" class="curved-text">
                <defs>
                  <path id="curve" d="M 100 250 A 200 200 0 0 1 500 250" fill="transparent" />
                </defs>
                <text font-size="28" font-weight="bold" fill="white">
                  <textPath href="#curve" startOffset="50%" text-anchor="middle">
                    <tspan class="char red">W</tspan>
                    <tspan class="char">e</tspan>
                    <tspan class="char">l</tspan>
                    <tspan class="char">c</tspan>
                    <tspan class="char">o</tspan>
                    <tspan class="char">m</tspan>
                    <tspan class="char">e</tspan>
                    <tspan>&nbsp;</tspan>
                    <tspan class="char red">T</tspan>
                    <tspan class="char">o</tspan>
                    <tspan>&nbsp;</tspan>
                    <tspan class="char red">E</tspan>
                    <tspan class="char">d</tspan>
                    <tspan class="char">u</tspan>
                    <tspan class="char">h</tspan>
                    <tspan class="char">u</tspan>
                    <tspan class="char">b</tspan>
                  </textPath>
                </text>
              </svg>
              <p class="subtitle animate-subtitle">Explore top courses and grow your skills.</p>
              <router-link to="/courses" class="cta-button animate-button" style="--clr: #00bcd4;">
                <span>Browse Courses</span>
                <i></i>
              </router-link>
            </div>
          </div>
        </div>


        <div v-if="!isEnrolling" class="popular-courses" ref="sectionRef">
          <h2>Popular Courses</h2>
          <div v-if="selectedCategory" class="selected-category">
            Showing results for <strong>{{ selectedCategory }}</strong>
          </div>
          <div class="course-list">
            <div v-for="course in filteredCourses" :key="course.id" class="course-card">
              <div class="image-container">
                <img :src="course.image" alt="Course Image" class="course-image" />
                <p v-if="course.premiumRequired" class="premium-label">🌟</p>
              </div>
              <h3>{{ course.title }}</h3>
              <p>{{ course.description }}</p>
              <p>Rating: {{ course.rating }}</p>
              <button @click="openCourseDetail(course)">View More</button>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <section class="categories-section" id="categories" ref="sectionRef">
          <h2 class="section-title">Explore Categories</h2>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.name" class="category-card"
              @click="filterByCategory(category.name)">
              <div class="category-icon">{{ category.icon }}</div>
              <div class="category-name">{{ category.name }}</div>
            </div>
          </div>
        </section>

        <!-- Features -->
        <section class="features-section" id="why-choose-us">
          <h2>Why Choose Us</h2>
          <p class="description">We provide a learning experience that’s modern, practical, and built for your success.
          </p>
          <div class="features-grid">
            <div class="feature-box">
              <div class="feature-icon">👨‍🏫</div>
              <div class="feature-title">Learn from Experts</div>
              <div class="feature-text">Courses taught by real industry professionals.</div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">📺</div>
              <div class="feature-title">Video-Based Lessons</div>
              <div class="feature-text">Engaging video content for every concept.</div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">🎓</div>
              <div class="feature-title">Certificates</div>
              <div class="feature-text">Receive certificates after course completion.</div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">📱</div>
              <div class="feature-title">Mobile Friendly</div>
              <div class="feature-text">Access content anytime, on any device.</div>
            </div>
          </div>
        </section>

        <!-- Instructors -->
        <section class="instructor-spotlight" id="instructors">
          <h2 class="section-title">Instructor Spotlight</h2>
          <p class="description">Meet our top-rated instructors who bring real-world experience to the virtual
            classroom.
          </p>
          <div class="instructor-grid">
            <div v-for="instructor in instructors" :key="instructor.name" class="instructor-card">
              <img :src="instructor.image" :alt="instructor.name" class="instructor-img" />
              <h3 class="instructor-name">{{ instructor.name }}</h3>
              <p class="instructor-bio">{{ instructor.bio }}</p>
            </div>
          </div>
        </section>

        <!-- How It Works -->
        <section class="how-it-works" id="how-it-works">
          <h2 class="section-title">How It Works</h2>
          <p class="description">Getting started is easy. Just follow these 4 simple steps:</p>
          <div class="steps-grid">
            <div class="step-card" v-for="(step, index) in steps" :key="index">
              <div class="icon-circle">
                <i :class="step.icon"></i>
              </div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Back to Top Button -->
    <button v-show="showBackToTop" @click="scrollToTop" class="back-to-top" aria-label="Back to Top">
      <i class="fas fa-arrow-up"></i>
    </button>
    <div v-if="!isChatCardVisible" class="admin-card" :class="{ expanded: isMessagesCardExpanded }">
      <img v-if="profileImage" :src="profileImage" class="admin-avatar" alt="Admin" />
      <i v-else class="fas fa-user admin-avatar"></i>

      <h2 class="admin-messages">Messages</h2>

      <!-- Search Bar -->
      <div class="search-container">
        <template v-if="showSearchInput">
          <input type="text" class="search-input" placeholder="Search..." v-model="searchQuery" @input="filterUsers" />
          <i class="fas fa-search search-input-icon"></i>
        </template>
        <template v-else>
          <i class="fas fa-search search-icon" @click="toggleSearchInput"></i>
        </template>
      </div>

      <!-- Only show user results when card is expanded -->
      <div class="search-results" v-if="isMessagesCardExpanded">
        <div class="user-result" v-for="user in displayedUsers" :key="user._id" @click="openChatCard(user)">
          <img :src="user.profileImageUrl" alt="User Image" class="user-image" />
          <span class="username">{{ user.username }}</span>
          <span v-if="getUnreadCount(user) > 0" class="badge">{{ getUnreadCount(user) }}</span>
        </div>
      </div>

      <button class="arrow-up" @click="toggleMessagesCard">
        <i :class="['fas', isMessagesCardExpanded ? 'fa-chevron-down' : 'fa-chevron-up']"></i>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
    </div>
    <div v-if="isChatCardVisible">
      <template v-if="selectedUser">
        <div class="chat-card">
          <div class="chat-header">
            <img :src="selectedUser.profileImageUrl || defaultProfile" alt="User Image" class="chat-user-image" />
            <span class="chat-username">{{ selectedUser.username }}</span>
            <button class="close-chat-btn" @click="isChatCardVisible = false">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="chat-body">
            <div v-for="msg in messages" :key="msg._id" :class="messageClass(msg)">
              <p>{{ msg.message }}</p>
              <small style="font-size: 0.6rem;">{{ formatTimestamp(msg.timestamp) }}</small>
            </div>
          </div>
          <div class="chat-footer">
            <input type="text" class="chat-input" placeholder="Type a message..." v-model="chatMessage" />
            <button v-if="!chatMessage" class="send-btn" @click="sendThumbsUp">
              <i class="fas fa-thumbs-up"></i>
            </button>
            <button v-else class="send-btn" @click="sendMessage">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="no-user-selected-message" style="padding: 1rem; font-style: italic; color: #666;">
          Select a user to send message.
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import heroImage from '../assets/images/background2.avif'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref, onMounted, nextTick, computed, onUnmounted, onActivated } from 'vue'

import { authState } from '../store/auth'
import icon from '../assets/images/logo2.png'
import Users from './Users.vue'
import MyCourses from './MyCourses.vue'

import course1 from '../assets/images/course1.avif'
import course2 from '../assets/images/course2.jpg'
import course3 from '../assets/images/course3.avif'
import course4 from '../assets/images/course4.avif'
import course5 from '../assets/images/course5.avif'
import course6 from '../assets/images/course6.avif'

import instructor1 from '../assets/images/instructor1.avif'
import instructor2 from '../assets/images/instructor2.avif'
import instructor3 from '../assets/images/instructor3.avif'

export default {
  components: { Users, MyCourses },
  setup() {
    let unreadInterval = null;
    const router = useRouter()
    const isDashboardVisible = ref(false)
    const profileImage = ref(localStorage.getItem('profileImage') || null)
    const userName = ref(localStorage.getItem('fullName') || 'Guest')
    const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')
    const userEmail = ref(localStorage.getItem('email') || '')
    const isPremium = ref(localStorage.getItem('premiumUser') === 'true');
    const email = userEmail.value
    const showUsersPage = ref(false)
    const showBackToTop = ref(false)
    const showMyCoursesPage = ref(false)
    const isEnrolling = ref(false)
    const myCourses = ref([])
    const isMessagesCardExpanded = ref(false);
    const showSearchInput = ref(false)
    const searchQuery = ref('')
    const allUsers = ref([])
    const filteredUsers = ref([])
    const selectedUser = ref(null)
    const isChatCardVisible = ref(false)
    const chatMessage = ref('')
    const unreadCount = ref(0)
    const messages = ref([])
    const showPremiumModal = ref(false)

    const openChatCard = async (user) => {
      console.log("Opening chat with user:", user)
      selectedUser.value = user
      isChatCardVisible.value = true
      isMessagesCardExpanded.value = false
      await fetchMessages()
    }

    const sendThumbsUp = () => {
      chatMessage.value = "👍";
      sendMessage();
    };

    const toggleSearchInput = () => {
      showSearchInput.value = !showSearchInput.value
    }

    const handleScroll = () => {
      showBackToTop.value = window.scrollY > 600
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const hasUnreadMessage = (user) => {
      return user.hasUnread;
    }

    const getUnreadCount = (user) => {
      const senderMessages = messages.value.filter(msg =>
        msg.sender === user.email &&
        msg.receiver === email &&
        !msg.read 
      );
      return senderMessages.length;
    }

    const totalUnreadCount = computed(() => {
      return messages.value.filter(msg => msg.receiver === email && !msg.read).length;
    });

    const steps = [
      {
        title: 'Sign Up',
        description: 'Create your free account to access all features.',
        icon: 'fas fa-user-plus',
      },
      {
        title: 'Choose a Course',
        description: 'Browse from a wide variety of skill-building courses.',
        icon: 'fas fa-book-open',
      },
      {
        title: 'Start Learning',
        description: 'Watch lessons and complete activities at your own pace.',
        icon: 'fas fa-laptop-code',
      },
      {
        title: 'Get Certified',
        description: 'Receive a certificate after completing your course.',
        icon: 'fas fa-certificate',
      },
    ]

    // Categories list
    const categories = ref([
      { name: 'Web Development', icon: '💻' },
      { name: 'Data Science', icon: '📊' },
      { name: 'Marketing', icon: '📈' },
      { name: 'Design', icon: '🎨' },
      { name: 'AI & ML', icon: '🤖' }
    ])

    // Selected category filter
    const selectedCategory = ref(null)
    const selectedCourse = ref(null)

    const openCourseDetail = (course) => {
      selectedCourse.value = course
      isEnrolling.value = true
    }

    const closeEnrollment = () => {
      isEnrolling.value = false
      selectedCourse.value = null
    }

    // Featured courses with category field added
    const featuredCourses = ref([
      {
        id: 1,
        title: 'Full Stack Web Development',
        description: 'Learn HTML, CSS, JS, and backend development.',
        fullDescription: 'Learn to build responsive websites using HTML, CSS, and JavaScript. Dive into backend development with Node.js and databases. Understand full-stack architecture, REST APIs, and deployment. Hands-on projects and real-world scenarios included. Perfect for aspiring web developers.',
        image: course1,
        rating: 4.8,
        category: 'Web Development',
        premiumRequired: true
      },
      {
        id: 2,
        title: 'Python for Data Science',
        description: 'Analyze data, visualize results, and build ML models.',
        fullDescription: 'Master the essentials of Python programming tailored for data analysis and machine learning. Learn libraries like NumPy, Pandas, Matplotlib, and Scikit-learn. Understand how to clean and visualize data, perform statistical analysis, and build predictive models. Includes real-world datasets and projects to strengthen your portfolio.',
        image: course2,
        rating: 4.7,
        category: 'Data Science'
      },
      {
        id: 3,
        title: 'UI/UX Design Essentials',
        description: 'Design user-centered interfaces with modern tools.',
        fullDescription: 'Explore the fundamentals of UI and UX design. Learn user research, wireframing, prototyping, and usability testing. Gain hands-on experience with tools like Figma and Adobe XD. Create aesthetically pleasing, user-friendly interfaces and design workflows that enhance user satisfaction. Ideal for beginners in design.',
        image: course3,
        rating: 4.6,
        category: 'Design'
      },
      {
        id: 4,
        title: 'Mobile App Development',
        description: 'Build native Android & iOS apps with Flutter.',
        fullDescription: 'Learn to develop cross-platform mobile apps using Flutter and Dart. Understand widget-based UI design, state management, and integration with APIs. Build fully functional Android and iOS apps from scratch. Ideal for those looking to enter the mobile app industry with real project experience.',
        image: course4,
        rating: 4.9,
        category: 'Web Development'
      },
      {
        id: 5,
        title: 'Mastering ChatGPT & AI Prompts',
        description: 'Learn how to effectively use ChatGPT, write powerful prompts, and automate tasks with AI.',
        fullDescription: 'Discover the power of AI prompt engineering with ChatGPT. Learn how to craft effective prompts for content creation, coding, summarization, automation, and more. Explore real use-cases and productivity hacks using AI tools. No prior experience required — perfect for creatives, developers, and professionals.',
        image: course5,
        rating: 4.8,
        category: 'AI & ML'
      },
      {
        id: 6,
        title: 'Introduction to Robotics & Automation',
        description: 'Explore the world of robotics, sensors, and control systems through hands-on projects.',
        fullDescription: 'Dive into the basics of robotics and automation technologies. Learn how robots work using sensors, microcontrollers (like Arduino), and control systems. Engage in hands-on projects to build and program simple robotic systems. A great starting point for engineering enthusiasts and hobbyists.',
        image: course6,
        rating: 4.7,
        category: 'AI & ML'
      }
    ])

    const instructors = ref([
      {
        name: 'Vishesh Leo',
        image: instructor1,
        bio: 'AI Researcher and Machine Learning expert with 10+ years of experience.',
      },
      {
        name: 'Rushaan Abbas',
        image: instructor2,
        bio: 'Full Stack Developer who’s helped 100K+ students learn web dev.',
      },
      {
        name: 'Asad Khan',
        image: instructor3,
        bio: 'UI/UX Specialist focused on human-centered design and accessibility.',
      }
    ])

    // Computed filtered courses based on selectedCategory
    const filteredCourses = computed(() => {
      if (!selectedCategory.value) return featuredCourses.value
      return featuredCourses.value.filter(course => course.category === selectedCategory.value)
    })

    // Filter handler function
    function filterByCategory(category) {
      selectedCategory.value = selectedCategory.value === category ? null : category
    }

    const sectionRef = ref(null)

    onMounted(async () => {
      window.addEventListener('scroll', handleScroll)
      const email = localStorage.getItem('email')
      if (email) {
        try {
          const endpoint = isAdmin.value
            ? 'http://localhost:5001/admin/get-profile'
            : 'http://localhost:5001/get-profile'

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })

          const data = await res.json()
          if (data.profileImage) {
            profileImage.value = data.profileImage
            localStorage.setItem('profileImage', data.profileImage)
          } else {
            profileImage.value = null
            localStorage.removeItem('profileImage')
          }

          if (data.fullName) {
            userName.value = data.fullName
            localStorage.setItem('fullName', data.fullName)
          }
        } catch (err) {
          console.error('Failed to load profile image:', err)
        }
      }

      // Animate hero elements
      await nextTick()
      document.querySelector('.hero-image')?.classList.add('slide-in')
      setTimeout(() => document.querySelector('.subtitle')?.classList.add('fade-in'), 1200)
      setTimeout(() => document.querySelector('.cta-button')?.classList.add('pop-in'), 1800)

      initObservers()
      fetchUnreadCount()
      unreadInterval = setInterval(fetchUnreadCount, 10000)
      fetchMessages()

    })


    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      console.log("Component unmounted")
      clearInterval(unreadInterval)
    })

    onActivated(() => {
      initObservers()
    })
    function initObservers() {
      const sections = [
        '.features-section',
        '.popular-courses',
        '.categories-section',
        '.how-it-works',
        '.instructor-spotlight'
      ]

      sections.forEach(selector => {
        const section = document.querySelector(selector)
        if (section) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                section.classList.add('in-view')
              } else {
                section.classList.remove('in-view')
              }
            },
            { threshold: 0.5 }
          )
          observer.observe(section)
        }
      })
    }

    const enrollNow = async () => {
      if (!selectedCourse.value || !userName.value || !userEmail.value) return;

      if (selectedCourse.value.premiumRequired && !isPremium.value) {
        alert('This course requires a Premium subscription. Please upgrade to enroll.');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5001/enroll-course', {
          fullName: userName.value,
          email: userEmail.value,
          courseTitle: selectedCourse.value.title,
          courseImage: selectedCourse.value.image
        });

        alert(response.data.message || 'Enrolled successfully!');
        closeEnrollment();
      } catch (error) {
        if (error.response?.status === 409) {
          alert('You are already enrolled in this course.');
        } else {
          console.error('Enrollment error:', error);
          alert('Enrollment failed. Please try again.');
        }
      }
    };

    const sendMessage = async () => {
      if (!chatMessage.value.trim()) {
        alert("Message cannot be empty.");
        return;
      }
      if (!userEmail.value) {
        alert("Sender email missing.");
        return;
      }
      if (!selectedUser.value?.username) {
        alert("Select a user to send message.");
        return;
      }

      const payload = {
        senderEmail: userEmail.value,
        receiverEmail: selectedUser.value.email,
        message: chatMessage.value.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log("📤 Payload being sent:", payload);

      try {
        await axios.post('http://localhost:5001/send-message', payload);
        messages.value.push(payload);
        chatMessage.value = '';
      } catch (error) {
        console.error("Failed to send message:", error.response?.data || error.message);
        alert('Failed to send message. Please try again.');
      }
    };

    const fetchMessages = async () => {
      if (!userEmail.value || !selectedUser.value?.email) return

      try {
        const res = await axios.post('http://localhost:5001/get-messages-between', {
          user1: userEmail.value,
          user2: selectedUser.value.email
        })
        messages.value = res.data || []

        // Mark these messages as read (where receiver is current user)
        await axios.post('http://localhost:5001/mark-messages-read', {
          senderEmail: selectedUser.value.email,
          receiverEmail: userEmail.value,
        })

        await fetchUnreadCount()
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    const fetchUnreadCount = async () => {
      if (!userEmail.value) return
      try {
        const res = await axios.get(`http://localhost:5001/unread-count?receiverEmail=${userEmail.value}`)
        if (res.data && typeof res.data.unreadCount === 'number') {
          unreadCount.value = res.data.unreadCount
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    const fetchMyCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/mycourses?email=${email.value}`)
        myCourses.value = response.data
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }

    const handleMyCourses = async () => {
      await fetchMyCourses()
      showMyCoursesPage.value = true
    }

    const fetchAllUsers = async () => {
      try {
        const [logins, admins] = await Promise.all([
          axios.get('http://localhost:5001/fetchusers'),
          axios.get('http://localhost:5001/fetchadmins')
        ])

        // Normalize users
        const users = [...logins.data, ...admins.data].map(user => ({
          _id: user._id,
          username: user.fullName,
          email: user.email,
          profileImageUrl: user.profileImage || 'default.jpg'
        }))
        allUsers.value = users
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    }

    const filterUsers = () => {
      const query = searchQuery.value.toLowerCase()
      filteredUsers.value = allUsers.value.filter(user =>
        (user.username || '').toLowerCase().includes(query)
      )
    }

    function toggleDashboard() {
      isDashboardVisible.value = !isDashboardVisible.value
    }

    const toggleMessagesCard = () => {
      fetchAllUsers();
      isMessagesCardExpanded.value = !isMessagesCardExpanded.value;

      if (isMessagesCardExpanded.value) {
        showSearchInput.value = true;
      } else {
        showSearchInput.value = false;
        searchQuery.value = "";
        displayedUsers.value = [];
      }
    };

    function logout() {
      authState.isAuthenticated = false
      localStorage.clear()
      router.push('/login')
    }

    async function handleProfileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageData = e.target.result
        profileImage.value = imageData
        localStorage.setItem('profileImage', imageData)

        const endpoint = isAdmin.value
          ? 'http://localhost:5001/admin/upload-profile'
          : 'http://localhost:5001/upload-profile'

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: localStorage.getItem('email'),
            profileImage: imageData
          })
        })
      }
      reader.readAsDataURL(file)
    }

    function fetchUsers() {
      showUsersPage.value = true
    }
    const displayedUsers = computed(() => {
      return searchQuery.value
        ? filteredUsers.value
        : allUsers.value;
    })

    return {
      heroImage,
      displayedUsers,
      hasUnreadMessage,
      getUnreadCount,
      totalUnreadCount,
      icon,
      isDashboardVisible,
      isMessagesCardExpanded,
      profileImage,
      userName,
      isAdmin,
      toggleDashboard,
      unreadCount,
      logout,
      handleProfileUpload,
      fetchUsers,
      showUsersPage,
      showMyCoursesPage,
      featuredCourses,
      sectionRef,
      categories,
      filterByCategory,
      selectedCategory,
      filteredCourses,
      instructors,
      steps,
      scrollToTop,
      showBackToTop,
      selectedCourse,
      isEnrolling,
      openCourseDetail,
      closeEnrollment,
      enrollNow,
      userName,
      userEmail,
      fetchMyCourses,
      myCourses: [],
      handleMyCourses,
      toggleMessagesCard,
      toggleSearchInput,
      showSearchInput,
      filterUsers,
      fetchAllUsers,
      searchQuery,
      filteredUsers,
      openChatCard,
      isChatCardVisible,
      selectedUser,
      sendMessage,
      fetchUnreadCount,
      chatMessage,
      messages,
      unreadInterval,
      localStorage,
      sendThumbsUp,
      showPremiumModal
    }
  },
  methods: {
    messageClass(msg) {
      const userEmail = localStorage.getItem('email') || '';
      return {
        'chat-message': true,
        'sent': msg.senderEmail === userEmail,
        'received': msg.senderEmail !== userEmail,
        'system-message': msg.isSystem || false,
      };
    },
    formatTimestamp(ts) {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return 'Unknown time';

      // Format time as HH:MM with leading zeros
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    upgradeNow() {
      alert("Redirecting to payment gateway...");
      this.showPremiumModal = false;
    },
    cancelPremium() {
      this.showPremiumModal = false;
    },
  }

}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;500&display=swap');

:root {
  --logout-clr: #ef4444;
  --cta-clr: #2563eb;
}



.navbar {
  background-color: rgba(0, 0, 0, 0.085);
  padding: 0px;
  position: fixed;
  top: 0;
  width: 100%;
  margin-left: -0.5rem;
  z-index: 10;
  display: flex;
  justify-content: flex-start;
  color: white;
}

.navbar .brand img {
  border-radius: 50%;
  margin-top: 0.3rem;
  margin-left: 2rem;
}

.dashboard-btn {
  background-color: rgba(0, 0, 0, 0.32);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  margin-left: 2rem;
  margin-top: 0.4rem;
  transition: background-color 0.3s ease;
}

.dashboard-btn:hover {
  background-color: #333;
}

.notification-icon {
  position: relative;
  margin-right: 0rem;
  margin-top: -1.7rem;
  font-size: 1.35rem;
  color: rgb(90, 90, 90);
  cursor: pointer;
  transition: color 0.3s ease;
}

.notification-icon:hover {
  color: black;
}

.notification-icon .badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: red;
  color: white;
  font-size: 0.7rem;
  padding: 2px 5px;
  border-radius: 50%;
}

.profile-wrapper {
  position: relative;
  display: inline-block;
}

.upload-plus-btn {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background-color: #2563eb;
  color: white;
  border-radius: 50%;
  padding: 4px 6px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.upload-plus-btn:hover {
  background-color: #1d4ed8;
}

.dashboard-btn img.profile-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.dashboard-btn i {
  font-size: 16px;
  color: white;
}

.dashboard-container {
  width: fit-content;
  background-color: rgba(0, 0, 0, 0.115);
  padding: 20px;
  position: fixed;
  top: 60px;
  right: 0;
  width: fit-content;
  max-width: 90vw;
  overflow-wrap: break-word;
  word-break: break-word;
  height: calc(50% - 60px);
  z-index: 20;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
  transform: translateX(0);
}

.dashboard-container.hidden {
  transform: translateX(100%);
}

/* Show Dashboard Container */
.dashboard-container.v-enter-active,
.dashboard-container.v-leave-active {
  transition: transform 0.3s ease-in-out;
}

.dashboard-container.v-enter,
.dashboard-container.v-leave-to {
  transform: translateX(100%);
  /* Transition to show/hide */
}

.dashboard-container.v-enter-to,
.dashboard-container.v-leave {
  transform: translateX(0);
}

/* BUBBLE BACKGROUND */
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  /* Keeps it behind dashboard content */
}

.bubbles {
  position: relative;
  display: flex;
  flex-wrap: wrap;
}

.bubbles span {
  position: relative;
  width: 5px;
  height: 5px;
  background: rgba(0, 0, 0, 0.342);
  margin: 0 4px;
  border-radius: 50%;
  animation: animate 15s linear infinite;
  animation-duration: calc(125s / var(--i));
}

.bubbles span:nth-child(even) {
  background: rgba(192, 192, 192, 0.435);
}

@keyframes animate {
  0% {
    transform: translateY(100vh) scale(0);
  }

  100% {
    transform: translateY(-10vh) scale(1);
  }
}

.edit-profile-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: #ffffff;
  transition: background 0.2s;
}

.edit-profile-label:hover {
  background-color: #f0f0f07e;
  color: black;
  border-radius: 20%;
}

.logout-button {
  position: absolute;
  top: 8rem;
  right: -2.5rem;
  background: #444;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px 5px;
  transition: 0.5s;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 12px #ffffff;
  display: inline-block;
  position: relative;
}

.logout-button:hover {
  letter-spacing: 0.25em;
  background: red;
  color: red;
  box-shadow: 0 0 35px red;
}

.logout-button::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: #27282c;
  border-radius: 6px;
}

.logout-button span {
  position: relative;
  z-index: 1;
}

.logout-button i {
  position: absolute;
  inset: 0;
  display: block;
}

.logout-button i::before {
  content: '';
  position: absolute;
  border: 2px solid white;
  width: 10px;
  height: 5px;
  top: -3.5px;
  left: 80%;
  background: #27282c;
  transform: translateX(-50%);
  transition: 0.5s;
}

.logout-button:hover i::before {
  border: 2px solid red;
  width: 20px;
  left: 20%;
}

.logout-button i::after {
  content: '';
  position: absolute;
  border: 2px solid white;
  width: 10px;
  height: 5px;
  bottom: -3.5px;
  left: 20%;
  background: #27282c;
  transform: translateX(-50%);
  transition: 0.5s;
}

.logout-button:hover i::after {
  border: 2px solid red;
  width: 20px;
  left: 80%;
}

.home-banner {
  background-color: #000;
  background-image: url('../assets/images/background2.avif');
  background-size: cover;
  background-position: center;
  position: relative;
  width: 101%;
  max-width: 1450px;
  height: 49.5rem;
  margin-left: -0.5rem;
  margin-top: -1rem;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hero-image {
  position: relative;
  width: 100%;
  height: 101%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transform: translateX(-100%);
  transition: transform 1.5s ease, opacity 0.1s ease;
}

.hero-image.slide-in {
  opacity: 1;
  transform: translateX(0);
}

.overlay-text {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  z-index: 1;
  text-align: center;
  width: 90%;
  max-width: 600px;
}

.curved-text .char {
  opacity: 0;
  animation: fade-in 0.5s ease forwards;
}

.curved-text .char:nth-child(1) {
  animation-delay: 1s;
}

.curved-text .char:nth-child(2) {
  animation-delay: 1.2s;
}

.curved-text .char:nth-child(3) {
  animation-delay: 1.4s;
}

.curved-text .char:nth-child(4) {
  animation-delay: 1.6s;
}

.curved-text .char:nth-child(5) {
  animation-delay: 1.8s;
}

.curved-text .char:nth-child(6) {
  animation-delay: 2s;
}

.curved-text .char:nth-child(7) {
  animation-delay: 2.2s;
}

.curved-text .char:nth-child(9) {
  animation-delay: 2.4s;
}

.curved-text .char:nth-child(10) {
  animation-delay: 2.6s;
}

.curved-text .char:nth-child(12) {
  animation-delay: 2.8s;
}

.curved-text .char:nth-child(13) {
  animation-delay: 3s;
}

.curved-text .char:nth-child(14) {
  animation-delay: 3.2s;
}

.curved-text .char:nth-child(15) {
  animation-delay: 3.4s;
}

.curved-text .char:nth-child(16) {
  animation-delay: 3.6s;
}

.curved-text .char:nth-child(17) {
  animation-delay: 3.8s;
}

.curved-text .char.red {
  fill: #ff022c;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}


.subtitle {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 2s ease, transform 5.5s ease;
}

.subtitle.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.animate-button {
  position: absolute;
  background: #444;
  color: #fff;
  top: 2rem;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 10px 5px;
  transition: 0.5s;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: inline-block;
  position: relative;
}

.animate-button:hover {
  letter-spacing: 0.25em;
  background: var(--clr);
  color: var(--clr);
  box-shadow: 0 0 35px var(--clr);
}

.animate-button::before {
  content: '';
  position: absolute;
  inset: 2px;
  background: #27282c;
  border-radius: 6px;
}

.animate-button span {
  position: relative;
  z-index: 1;
}

.animate-button i {
  position: absolute;
  inset: 0;
  display: block;
}

.animate-button i::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  top: -3.5px;
  left: 82%;
  background: #c9c9c9;
  transform: translateX(-50%);
  transition: 0.5s;
}

.animate-button:hover i::before {
  background: #27282c;
  border: 2px solid var(--clr);
  width: 20px;
  left: 20%;
}

.animate-button i::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  bottom: -3.5px;
  left: 18%;
  background: #c9c9c9;
  transform: translateX(-50%);
  transition: 0.5s;
}

.animate-button:hover i::after {
  background: #27282c;
  border: 2px solid var(--clr);
  width: 20px;
  left: 80%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  padding: 0 10px;
}

.dashboard-profile-img {
  width: 34px;
  height: 34px;
  margin-left: -1rem;
  border-radius: 50%;
  object-fit: cover;
}

.default-user-icon {
  font-size: 64px;
  color: white;
  margin-bottom: 0.5rem;
}

.user-name {
  color: white;
  text-align: left;
  font-size: 20px;
  font-weight: bold;
  white-space: nowrap;
}

.user-divider {
  margin: 12px 0;
  border: none;
  border-top: 1px solid #ccc;
  width: 100%;
}

.users-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 1rem;
  font-size: 1rem;
  background: none;
  border: none;
  gap: 10px;
  padding: 8px 12px;
  color: #ffffff;
  transition: background 0.2s, color 0.2s;
}

.users-button i {
  font-size: 1.2rem;
}

.users-button:hover {
  background-color: #f0f0f07e;
  color: black;
  border-radius: 20%;
}

.popular-courses {
  width: 99%;
  border-radius: 1%;
  margin-left: -1rem;
  padding: 60px 20px;
  background: #ffffff;
  transition: background-color 0.8s ease;
  text-align: center;
}

.popular-courses.in-view {
  background-color: #000000;
  color: #fff;
}

.popular-courses.in-view h2,
.popular-courses.in-view .course-card h3,
.popular-courses.in-view .course-card p {
  color: #fff;
}

.popular-courses.in-view .course-card {
  background: #1a1a1a;
}

.popular-courses.in-view .course-card p:last-of-type {
  color: #ffcc00;
}

.popular-courses.in-view .course-card button {
  background-color: #ffcc00;
  color: #000;
}

.popular-courses h2 {
  font-size: 2.5rem;
  margin-bottom: 40px;
  color: #333;
  font-weight: 700;
  letter-spacing: 1px;
}

.course-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
}

.course-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.course-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.course-card h3 {
  font-size: 1.4rem;
  color: #222;
  margin-bottom: 10px;
  font-weight: 600;
}

.course-card p {
  color: #555;
  font-size: 0.95rem;
  margin-bottom: 10px;
  line-height: 1.4;
}

.course-card p:last-of-type {
  font-weight: 600;
  color: #ff9800;
}

.course-card button {
  align-self: flex-start;
  padding: 10px 18px;
  background-color: #00bcd4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: auto;
}

.course-card button:hover {
  background-color: #0097a7;
}







.features-section {
  padding: 4rem 1rem;
  background-color: white;
  color: black;
  text-align: center;
  transition: background-color 1s ease, color 1s ease;
}

.features-section.in-view {
  background-color: black;
  color: white;
}

.features-section.in-view h2 {
  color: white;
}

.features-section.in-view .feature-title {
  color: #111827;
}

.features-section.in-view .description {
  color: #ffffff;
}

.features-section.in-view .feature-text {
  color: #2b2b2b;
}

.features-section h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
  /* Gray-800 */
}

.features-section p.description {
  color: #6b7280;
  /* Gray-500 */
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1rem;
}

.features-grid {
  display: grid;
  width: 50%;
  grid-template-columns: repeat(2, 1fr);
  gap: 10rem;
  margin-left: 20rem;
}

.feature-box {
  background-color: #f5f5f5c0;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #111827;
  /* Gray-900 */
}

.feature-text {
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.5;
}






.categories-section {
  background: #f8f9fa;
  padding: 4rem 2rem;
  text-align: center;
  transition: background-color 1s ease, color 1s ease;
}

.categories-section.in-view {
  background-color: black;
  color: white;
}

.categories-section.in-view h2 {
  color: white;
}

.categories-section.in-view .category-name {
  color: #111827;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: bold;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.category-card {
  background-color: #ffffffd4;
  border-radius: 1rem;
  padding: 2rem 1rem;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.category-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.selected-category {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}






.instructor-spotlight {
  padding: 4rem 1rem;
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  text-align: center;
  transition: background-color 1s ease, color 1s ease;
}

.instructor-spotlight.in-view {
  background-color: black;
  color: white;
}

.instructor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.instructor-card {
  background: rgb(255, 255, 255);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.instructor-card:hover {
  transform: translateY(-5px);
}

.instructor-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.instructor-name {
  color: black;
  font-weight: bold;
  font-size: 1.1rem;
}

.instructor-bio {
  color: #000000;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}



.how-it-works {
  padding: 4rem 1rem;
  background: #fff;
  color: black;
  text-align: center;
  transition: background-color 1s ease, color 1s ease;
}

.how-it-works.in-view {
  background: black;
  color: white;
}

.how-it-works.in-view .step-title {
  color: black;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.step-card {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.step-card:hover {
  transform: translateY(-6px);
}

.icon-circle {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.step-desc {
  font-size: 0.95rem;
  color: #555;
  margin-top: 0.5rem;
}



.back-to-top {
  position: fixed;
  bottom: 2rem;
  left: 40rem;
  background-color: #ffffff95;
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transition: background-color 0.3s;
}

.back-to-top:hover {
  background-color: #00000097;
  color: white;
}

.course-detail-page {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 600px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.553);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  overflow-y: auto;
  transition: right 0.4s ease;
}

.course-detail-page.slide-in {
  right: 0;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  z-index: 10;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #e74c3c;
}

.course-detail-container {
  display: flex;
  max-width: 1000px;
  gap: 30px;
  margin-top: 13rem;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}

.course-detail-image {
  width: 200px;
  border-radius: 12px;
  object-fit: cover;
}

.course-detail-info {
  flex: 1;
}

.course-description {
  margin: 20px 0;
  line-height: 1.6;
}

.main-content-wrapper.blurred {
  filter: blur(10px);
  pointer-events: none;
  transition: filter 0.3s ease;
}

.my-courses-list {
  padding: 30px;
  background: #f4f6f8;
}

.my-courses-list h3 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.course-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transition: transform 0.3s ease;
  margin-bottom: 20px;
}

.course-card:hover {
  transform: translateY(-4px);
}

.image-container {
  position: relative;
  display: inline-block;
  width: 100%;
  height: auto;
}

.course-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
}

.premium-label {
  position: absolute;
  top: -17px;
  right: 0px;
  background-color: black;
  font-size: 10rem;
  padding: 4px 8px;
}

.course-details {
  padding: 12px 0;
}

.course-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #222;
}

.course-description {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 10px;
}

.user-meta {
  font-size: 0.9rem;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.user-meta p {
  margin: 4px 0;
}

.admin-card {
  position: fixed;
  bottom: -10px;
  right: 20px;
  width: 250px;
  height: 70px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 999;
  flex-direction: row;
  overflow: visible;
  cursor: pointer;
  z-index: 30;
}

.admin-card.expanded {
  height: 500px;
  width: 280px;
  flex-direction: row;
  /* keep row */
  align-items: start;
  justify-content: space-between;
  padding: 16px;
  transition: height 0.3s ease, padding 0.3s ease;
  overflow-y: auto;
}

/* Optional: Slightly upscale avatar */
.admin-card.expanded .admin-avatar {
  width: 50px;
  height: 50px;
  transition: all 0.3s ease;
}

/* Optional: Slightly bigger text */
.admin-card.expanded .admin-messages {
  font-size: 18px;
  margin-left: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
}

/* Optional: Adjust search icon spacing */
.admin-card.expanded .search-icon {
  font-size: 22px;
  margin-right: 3rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.admin-card.expanded .arrow-up {
  position: fixed;
  bottom: 24rem;
  left: 97%;
  transform: translateX(-50%);
  padding: 0px;
  text-decoration: none;
  background: none;
  border: none;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.search-icon {
  font-size: 20px;
  color: #333;
  margin-right: 3rem;
}

.arrow-up {
  position: absolute;
  bottom: 3rem;
  top: 25%;
  left: 90%;
  transform: translateX(-50%);
  padding: 6px;
  text-decoration: none;
  background: none;
  border: none;
}

.arrow-up i {
  font-size: 20px;
  color: #333;
}

.arrow-up:hover i {
  color: #000000;
  border-radius: 100%;
  padding: 6px;
  background-color: rgba(51, 51, 51, 0.127);
  cursor: pointer;
  transition: color 0.3s ease;
}

.admin-messages {
  font-size: 16px;
  color: #1e1e1e;
  margin-left: 10px;
  margin-right: auto;
  font-weight: 700;
}

.search-container {
  position: fixed;
  margin-top: 5rem;
  margin-left: -0.3rem;
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 15px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  background-color: #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.search-input-icon {
  position: absolute;
  right: 15px;
  top: 10px;
  font-size: 1rem;
  color: #555;
}

.search-icon {
  font-size: 1.2rem;
  cursor: pointer;
  color: #fff;
  transition: color 0.3s;
}

.search-icon:hover {
  color: #ccc;
}

.search-results {
  width: 100%;
  margin-top: 9rem;
  margin-left: -8.5rem;
  padding: 0.5rem;
  background: none;
  border: 0px solid #ddd;
  border-radius: 0px;
  max-height: auto;
  overflow-y: auto;
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.1);
}

.user-result {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.user-result:last-child {
  border-bottom: none;
}

.user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.username {
  font-weight: 500;
  font-size: 1rem;
  color: #333;
}

.chat-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f0f0f0;
}

.chat-user-image {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
}

.close-chat-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
}

.chat-footer {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.chat-input {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 8px;
}

.send-btn {
  background: rgb(0, 43, 173);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
}

.chat-message {
  margin: 8px;
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  word-wrap: break-word;
}

.sent {
  background-color: #daf1da;
  align-self: flex-end;
  text-align: right;
}

.received {
  background-color: #f1f1f1;
  align-self: flex-start;
  text-align: left;
}

.chat-body {
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.badge {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 0.3em 0.6em;
  font-size: 0.75em;
  margin-left: 8px;
}

.premium-btn {
  background-color: rgb(227, 193, 0);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  position: relative;
  /* required for pseudo-element */
  overflow: hidden;
  margin-left: 65.5rem;
  margin-top: 0.8rem;
}

/* Light sweep effect */
.premium-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(120deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%);
  transform: skewX(-20deg);
  animation: sweep 2s infinite;
  pointer-events: none;
}

@keyframes sweep {
  0% {
    left: -75%;
  }

  100% {
    left: 125%;
  }
}

/* Hover + Pulse Effect */
.premium-btn:hover {
  background-color: #d8ad00;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.7);
}

/* Pulse animation stays the same */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }

  50% {
    transform: scale(1.03);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 400px;
  text-align: center;
  animation: slideDown 0.4s ease;
}

.modal-content h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal-content p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.modal-upgrade {
  background-color: gold;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  margin-right: 10px;
  font-weight: bold;
  cursor: pointer;
}

.modal-cancel {
  background-color: #ddd;
  color: #333;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
}

@keyframes slideDown {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>