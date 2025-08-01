<template>
  <div :class="['courses-container', { 'premium-active': isPremium }]">
    <!-- Back Button -->
    <button @click="goHome" class="back-button">
      ← Back to Home
    </button>

    <div class="user-actions">
      <button v-if="isPremium" class="cancel-subscription-btn" @click="cancelSubscription">
        Cancel Subscription
      </button>
    </div>

    <h2 class="section-heading">Available Courses</h2>

    <div :class="['course-detail-page', { 'slide-in': isEnrolling }]">
      <div class="course-detail-container" v-if="selectedCourse">
        <!-- Close Button -->
        <button class="close-btn1" @click="closeEnrollment">✕</button>

        <img :src="selectedCourse.image" :alt="selectedCourse.title" class="course-detail-image" />
        <div class="course-detail-info">
          <h2>{{ selectedCourse.title }}</h2>
          <p class="course-description1">
            {{ selectedCourse.fullDescription || selectedCourse.description }}
          </p>
          <button class="enroll-button" @click="enrollNow">
            {{ selectedCourse.premiumRequired && !isPremium ? 'Premium' : 'Enroll Now' }}
          </button>
        </div>
      </div>
      <!-- Premium Modal -->
      <div v-if="showPremiumModal" class="modal-overlay">
        <div class="modal-content">
          <h2>Unlock Premium Access</h2>
          <p>Gain access to exclusive courses, content, and features by upgrading to Premium.</p>
          <button class="modal-upgrade" @click="goToUpgrade">Upgrade Now</button>
          <button class="modal-cancel" @click="closePremiumModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Select Categories Button -->
    <button @click="scrollToCategories" class="category-btn">
      📚 Select Categories
    </button>
    <button v-if="selectedCategory" @click="selectedCategory = null" class="category-btn clear-btn">
      ❌ Clear Category Filter
    </button>

    <!-- Category Popup -->
    <div v-if="showCategoryPopup" class="category-popup-overlay" @click.self="closeCategoryPopup">
      <div class="category-popup">
        <h3>Select a Category</h3>
        <ul class="category-list">
          <li v-for="(category, index) in categories" :key="index">
            <button @click="scrollToCategory(category.key)">
              {{ category.icon }} {{ category.name }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div :class="['main-content-wrapper', { blurred: isEnrolling }]">
      <div class="filter-section">
        <input v-model="searchQuery" type="text" placeholder="Search courses by title, category or tutor..."
          class="search-input" />
      </div>

      <div v-for="(group, index) in filteredCourses" :key="index" class="category-section"
        :data-category="group.category.replace(/[^a-zA-Z ]/g, '')">
        <h3 class="category-heading">{{ group.category }}</h3>
        <div class="course-grid">
          <div v-for="(course, idx) in group.courses" :key="idx" class="course-card">
            <div class="image-container">
              <img :src="course.image" alt="Course Image" class="course-image" />
              <p v-if="course.premiumRequired" class="premium-label">🌟</p>
            </div>
            <h4 class="course-title" v-html="highlightMatch(course.title, searchQuery)"></h4>
            <p class="course-description">{{ course.description }}</p>
            <p class="course-tutor" v-html="`Tutor: ${highlightMatch(course.tutor, searchQuery)}`"></p>
            <button class="enroll-button" @click="openCourseDetail(course)">View More</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue';
import axios from 'axios'

const searchQuery = ref('');
const isEnrolling = ref(false)
const selectedCourse = ref(null)
const userName = ref(localStorage.getItem('fullName') || 'Guest')
const userEmail = ref(localStorage.getItem('email') || '')
const isPremium = ref(localStorage.getItem('premiumUser') === 'true');
const categorySection = ref(null)
const showCategoryPopup = ref(false)
const selectedCategory = ref(null);
const showPremiumModal = ref(false)

const scrollToCategories = () => {
  showCategoryPopup.value = true
}

const closeCategoryPopup = () => {
  showCategoryPopup.value = false
}

const scrollToCategory = (categoryKey) => {
  showCategoryPopup.value = false
  selectedCategory.value = categoryKey
  const section = document.querySelector(`[data-category="${categoryKey}"]`)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' })
  }
}

const categories = ref([
  { name: 'IT Courses', key: 'IT', icon: '💻' },
  { name: 'Data Science', key: 'Data', icon: '📊' },
  { name: 'Marketing', key: 'Marketing', icon: '📈' },
  { name: 'Design', key: 'Design', icon: '🎨' },
  { name: 'AI & ML', key: 'AI', icon: '🤖' }
])

const openCourseDetail = (course) => {
  selectedCourse.value = course
  isEnrolling.value = true
}

const closeEnrollment = () => {
  isEnrolling.value = false
  selectedCourse.value = null
}

const router = useRouter()
const goHome = () => {
  router.push('/')
}

const goToUpgrade = () => {
  localStorage.setItem('premiumUser', 'true');
  isPremium.value = true;
  router.push('/courses');
};

const closePremiumModal = () => {
  showPremiumModal.value = false;
}

const cancelSubscription = () => {
  localStorage.setItem('premiumUser', 'false');
  isPremium.value = false;
  alert('Your Premium subscription has been cancelled.');
};

const highlightMatch = (text, query) => {
  console.log('Highlighting:', text, query);
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const enrollNow = async () => {
  if (!selectedCourse.value || !userName.value || !userEmail.value) return;

  if (selectedCourse.value.premiumRequired && !isPremium.value) {
    showPremiumModal.value = true;
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

import course1 from '../assets/images/course1.avif'
import course2 from '../assets/images/course2.jpg'
import course3 from '../assets/images/course3Image.jpg'
import course4 from '../assets/images/node.png'
import course5 from '../assets/images/database.jpg'
import course6 from '../assets/images/DevOps.jpg'
import course7 from '../assets/images/Networking.jpg'
import course8 from '../assets/images/linux.webp'
import course9 from '../assets/images/Cybersecurity.jpg'
import course10 from '../assets/images/course4.avif'
import course11 from '../assets/images/DigitalMarketing.png'
import course12 from '../assets/images/SocialMedia.jpg'
import course13 from '../assets/images/EmailMarketing.jpg'
import course14 from '../assets/images/InfluencerMarketing.webp'
import course15 from '../assets/images/AnalyticsMarketers.jpg'
import course16 from '../assets/images/ContentCreation.png'
import course17 from '../assets/images/VideoMarketing.jpeg'
import course18 from '../assets/images/AffiliateMarketing.jpeg'
import course19 from '../assets/images/Entrepreneurship101.png'
import course20 from '../assets/images/FinancialLiteracy.webp'
import course21 from '../assets/images/BusinessStrategy.jpg'
import course22 from '../assets/images/ProjectManagement.png'
import course23 from '../assets/images/HRManagement.webp'
import course24 from '../assets/images/OperationsManagement.jpg'
import course25 from '../assets/images/LeadershipSkills.png'
import course26 from '../assets/images/TimeManagement.webp'
import course27 from '../assets/images/NegotiationSkills.jpeg'
import course28 from '../assets/images/Funding.jpg'
import course29 from '../assets/images/ChatGPT.webp'
import course30 from '../assets/images/Midjourney.jpg'
import course31 from '../assets/images/No-Code.webp'
import course32 from '../assets/images/AIBusiness.jpg'
import course33 from '../assets/images/PromptEngineering.jpg'
import course34 from '../assets/images/AIMarketing.png'
import course35 from '../assets/images/AIArtTools.jpg'
import course36 from '../assets/images/VoiceAI.jpg'
import course37 from '../assets/images/DataAnalysisAI.jpeg'
import course38 from '../assets/images/AIEthics.png'
import course39 from '../assets/images/GraphicDesign.jpg'
import course40 from '../assets/images/UI:UXDesign.jpg'
import course41 from '../assets/images/AdobePhotoshop.jpeg'
import course42 from '../assets/images/CanvaBeginners.png'
import course43 from '../assets/images/MotionGraphics.jpg'



const categorizedCourses = [
  {
    key: "IT",
    category: "💻 IT Courses",
    courses: [
      {
        title: "Full Stack Web Development",
        description: "Build web applications",
        fullDescription: "Learn to develop complete web applications using the MERN (MongoDB, Express, React, Node.js) stack. This course covers everything from frontend design to backend APIs and deploying your application to the cloud.",
        tutor: "John Doe", image: course1,
        premiumRequired: true
      },
      {
        title: "Python for Data Science",
        description: "Python for analysis",
        fullDescription: "Master Python programming with a focus on data science tools such as NumPy, Pandas, and Matplotlib. Analyze datasets, create visualizations, and gain hands-on experience solving real-world data problems.",
        tutor: "Jane Smith", image: course2,
        premiumRequired: true
      },
      {
        title: "Frontend with Vue.js",
        description: "Build dynamic UIs",
        fullDescription: "Explore the Vue.js framework to create interactive single-page applications. Learn Vue components, props, events, routing, and how to integrate APIs for real-time content updates.",
        tutor: "Sara Lee", image: course3
      },
      {
        title: "Backend with Node.js",
        description: "Create APIs & servers",
        fullDescription: "Develop backend services and RESTful APIs using Node.js and Express. Understand routing, middleware, authentication, and integration with MongoDB for building scalable server-side applications.",
        tutor: "Mark Stone", image: course4
      },
      {
        title: "Database Design",
        description: "Model data structures",
        fullDescription: "Learn to design relational and non-relational databases, including MySQL and MongoDB. Topics include schema design, normalization, indexing, relationships, and database optimization.",
        tutor: "Alan Ray", image: course5
      },
      {
        title: "DevOps Essentials",
        description: "Automate deployment",
        fullDescription: "Understand DevOps fundamentals including version control, CI/CD pipelines, Docker containers, and cloud services like AWS. Learn to automate and manage the full software lifecycle efficiently.",
        tutor: "Rita Lane", image: course6
      },
      {
        title: "Networking Basics",
        description: "Learn network setup",
        fullDescription: "This course introduces the principles of computer networking including IP addressing, subnetting, routing, switching, and protocols like TCP/IP. Ideal for beginners looking to build a solid foundation.",
        tutor: "Tom Keller", image: course7
      },
      {
        title: "Linux Administration",
        description: "Manage Linux systems",
        fullDescription: "Master the Linux command line and system administration tasks such as user management, file permissions, package installation, services, and scripting. Prepares you for real-world sysadmin roles.",
        tutor: "Leah Brooks", image: course8
      },
      {
        title: "Cybersecurity Fundamentals",
        description: "Protect digital assets",
        fullDescription: "Learn the basics of cybersecurity including common threats, encryption, firewalls, and security protocols. Get introduced to ethical hacking, penetration testing, and network defense strategies.",
        tutor: "Kevin Moore", image: course9,
        premiumRequired: true
      },
      {
        title: "Mobile App Dev",
        description: "Build mobile apps",
        fullDescription: "Learn to develop high-performance, cross-platform mobile applications using Flutter and Dart. This course covers everything from setting up the development environment to creating fully functional Android and iOS apps. You'll explore widgets, state management, navigation, Firebase integration, and deploying apps to the Play Store and App Store.",
        tutor: "Alex Wang",
        image: course10,
        premiumRequired: true
      }
    ]
  },
  {
    key: "Marketing",
    category: "📈 Marketing Courses",
    courses: [
      {
        title: "Digital Marketing Basics",
        description: "Master the digital landscape",
        fullDescription: "Explore the fundamentals of digital marketing including SEO (Search Engine Optimization), SEM (Search Engine Marketing), content marketing, and digital branding. Learn how to build effective campaigns across digital platforms and understand the customer journey online.",
        tutor: "Clara Morris",
        image: course11,
        premiumRequired: true
      },
      {
        title: "Social Media Strategy",
        description: "Grow your online presence",
        fullDescription: "Develop powerful social media strategies to build your brand, engage followers, and drive conversions. This course covers platform selection, content calendars, analytics, and social advertising tactics for platforms like Instagram, Facebook, LinkedIn, and TikTok.",
        tutor: "Ben Charles",
        image: course12,
        premiumRequired: true
      },
      {
        title: "Email Marketing",
        description: "Run effective email campaigns",
        fullDescription: "Learn how to design, write, and automate email marketing campaigns that engage your audience and increase conversions. Topics include segmentation, personalization, A/B testing, and using tools like Mailchimp and SendGrid.",
        tutor: "Daisy Lin",
        image: course13
      },
      {
        title: "Influencer Marketing",
        description: "Boost brand using influencers",
        fullDescription: "Understand how to collaborate with influencers to expand brand reach and credibility. This course covers identifying the right influencers, managing campaigns, FTC compliance, and measuring ROI.",
        tutor: "Ken Adams",
        image: course14
      },
      {
        title: "Analytics for Marketers",
        description: "Track and improve performance",
        fullDescription: "Master data-driven marketing with tools like Google Analytics, Facebook Insights, and UTM tracking. Learn how to interpret key metrics, set up conversion goals, and make strategic decisions based on performance data.",
        tutor: "Alice Park",
        image: course15,
        premiumRequired: true
      },
      {
        title: "Content Creation",
        description: "Make content that connects",
        fullDescription: "Discover techniques to create engaging written, visual, and multimedia content for blogs, websites, and social media. Learn storytelling, content planning, branding, and using tools like Canva and Adobe Express.",
        tutor: "Leo Jenkins",
        image: course16
      },
      {
        title: "Video Marketing",
        description: "Engage through video",
        fullDescription: "Learn to create compelling video content for YouTube, Instagram, and TikTok. Topics include scripting, filming, editing, storytelling, and optimizing video content for engagement and SEO.",
        tutor: "Sophie Kim",
        image: course17
      },
      {
        title: "Affiliate Marketing",
        description: "Earn through partnerships",
        fullDescription: "Understand the affiliate marketing ecosystem and how to promote products/services for commission. Learn how to select affiliate programs, create landing pages, drive traffic, and comply with legal policies.",
        tutor: "Rick Young",
        image: course18
      }
    ]
  },
  {
    key: "Business",
    category: "📢 Business Courses",
    courses: [
      {
        title: "Entrepreneurship 101",
        description: "Start your business journey",
        fullDescription: "Learn how to turn your innovative ideas into successful businesses. This course covers business planning, market research, product validation, pitching, and how to launch a startup with limited resources.",
        tutor: "Daniel Moore",
        image: course19,
        premiumRequired: true
      },
      {
        title: "Financial Literacy",
        description: "Master personal and business finance",
        fullDescription: "Build strong financial foundations by learning budgeting, saving, investing, and debt management. This course also introduces key business finance concepts such as profit margins, cash flow, and financial statements.",
        tutor: "Emma Lewis",
        image: course20,
        premiumRequired: true
      },
      {
        title: "Business Strategy",
        description: "Plan for long-term success",
        fullDescription: "Develop strategic thinking to create competitive advantages in the business world. Topics include SWOT analysis, market positioning, business models, and case studies of real-world companies.",
        tutor: "Victor Trent",
        image: course21
      },
      {
        title: "Project Management",
        description: "Deliver projects on time",
        fullDescription: "Learn to manage projects using Agile, Waterfall, and hybrid methods. This course includes tools like Gantt charts, Kanban boards, risk management, and stakeholder communication.",
        tutor: "Linda Zhou",
        image: course22
      },
      {
        title: "HR Management",
        description: "Build strong teams",
        fullDescription: "Gain essential skills in recruitment, training, performance evaluation, and employee retention. Understand HR policies, workplace ethics, and how to foster a positive company culture.",
        tutor: "Jake Turner",
        image: course23
      },
      {
        title: "Operations Management",
        description: "Optimize business processes",
        fullDescription: "Improve organizational efficiency through supply chain management, workflow design, quality control, and resource planning. This course helps streamline operations for better productivity and profitability.",
        tutor: "Nora Blake",
        image: course24
      },
      {
        title: "Leadership Skills",
        description: "Lead with impact",
        fullDescription: "Develop essential leadership qualities such as communication, decision-making, conflict resolution, and motivation. Learn how to manage teams and inspire innovation in any business environment.",
        tutor: "Sam O'Connor",
        image: course25,
        premiumRequired: true
      },
      {
        title: "Time Management",
        description: "Get more done every day",
        fullDescription: "Boost your productivity by mastering time-blocking, prioritization, task delegation, and focus techniques. Perfect for busy professionals looking to balance work, study, and life effectively.",
        tutor: "Kim Patel",
        image: course26
      },
      {
        title: "Negotiation Skills",
        description: "Win deals and resolve disputes",
        fullDescription: "Learn how to negotiate effectively in business and personal scenarios. Topics include persuasive communication, conflict resolution, active listening, and achieving win-win outcomes.",
        tutor: "Ethan Wu",
        image: course27
      },
      {
        title: "Start-Up Funding",
        description: "Secure investment and scale fast.",
        fullDescription: "Dive into the world of startup finance and discover how to secure the capital you need to launch and grow your business. This course covers funding types such as bootstrapping, angel investment, venture capital, crowdfunding, and grants. Learn how to craft compelling investor pitches, prepare solid business plans, and understand key financial metrics that investors look for. You'll also explore valuation techniques, equity distribution, and the stages of fundraising from seed to Series A and beyond.",
        tutor: "Grace Lin",
        image: course28
      }
    ]
  },
  {
    key: "AI",
    category: "🤖 AI & ML",
    courses: [
      {
        title: "Intro to ChatGPT",
        description: "Understand how ChatGPT works and its uses.",
        fullDescription: "This course introduces you to ChatGPT, an advanced conversational AI model developed by OpenAI. You'll learn about its underlying architecture, common use cases such as writing, coding, and customer support, and how to integrate it into your own applications. Ideal for beginners, this course demystifies how large language models function and how to interact with them effectively.",
        tutor: "Mila Gray",
        image: course29,
        premiumRequired: true
      },
      {
        title: "Using Midjourney",
        description: "Generate stunning images with AI.",
        fullDescription: "Explore the creative possibilities of AI-generated art using Midjourney. This course walks you through prompt engineering, style customization, and project-based workflows to help you create compelling visuals for marketing, design, or personal projects. No prior design experience needed—just your imagination.",
        tutor: "Evan Ross",
        image: course30,
        premiumRequired: true
      },
      {
        title: "No-Code AI",
        description: "Build smart tools with no coding.",
        fullDescription: "Learn how to create intelligent applications without writing a single line of code. Using platforms like Bubble, Peltarion, and Zapier AI integrations, this course enables you to design chatbots, predictive models, and automation workflows tailored to your business or project needs.",
        tutor: "Lily Owens",
        image: course31
      },
      {
        title: "AI for Business",
        description: "Leverage AI to improve operations.",
        fullDescription: "Discover how AI can streamline processes, improve customer experience, and boost productivity in various business functions. This course explores tools for automation, predictive analytics, virtual assistants, and AI-enhanced decision-making to give your company a competitive edge.",
        tutor: "Derek Miles",
        image: course32,
        premiumRequired: true
      },
      {
        title: "Prompt Engineering",
        description: "Craft better AI prompts.",
        fullDescription: "Master the art and science of writing prompts that produce accurate, creative, and efficient responses from language models like ChatGPT and Claude. This course covers prompt structure, chaining, context tuning, and practical examples across different domains.",
        tutor: "Cleo Nash",
        image: course33,
        premiumRequired: true
      },
      {
        title: "AI in Marketing",
        description: "Automate marketing using AI tools.",
        fullDescription: "Explore how artificial intelligence is revolutionizing digital marketing. From automating content creation and customer segmentation to ad targeting and campaign optimization, you'll gain hands-on experience with leading AI platforms used by modern marketers.",
        tutor: "Tina Huang",
        image: course34
      },
      {
        title: "AI Art Tools",
        description: "Create art with DALL·E & Midjourney.",
        fullDescription: "Learn to generate unique, high-quality artwork using cutting-edge tools like DALL·E and Midjourney. You'll explore artistic styles, concept visualization, and how to incorporate AI-generated art into branding, NFTs, and digital content creation.",
        tutor: "Zane Wells",
        image: course35
      },
      {
        title: "Voice AI",
        description: "Use voice-based assistants and tools.",
        fullDescription: "Delve into the world of voice-based AI including Alexa, Google Assistant, and custom voice bots. You'll learn how to design, deploy, and refine voice user interfaces (VUIs) for smart devices, customer service, and personal productivity.",
        tutor: "Jared Nash",
        image: course36
      },
      {
        title: "Data Analysis with AI",
        description: "Analyze big data using ML models.",
        fullDescription: "This course teaches you how to use AI and machine learning to extract insights from large datasets. You'll work with platforms like Python, Power BI, and Google AutoML to perform data cleaning, visualization, trend forecasting, and decision-making.",
        tutor: "Tara Singh",
        image: course37,
        premiumRequired: true
      },
      {
        title: "AI Ethics",
        description: "Explore ethical implications of AI.",
        fullDescription: "Investigate the social, moral, and legal challenges of AI. Topics include bias in algorithms, data privacy, surveillance, autonomous decision-making, and AI governance. This course is essential for anyone designing or deploying AI systems responsibly.",
        tutor: "Ian Lee",
        image: course38
      }
    ]
  },
  {
    key: "Design",
    category: "📈 Design",
    courses: [
      {
        title: "Graphic Design Fundamentals",
        description: "Master the core principles of visual design",
        fullDescription: "Dive into the essential elements of graphic design, including color theory, typography, layout, and composition. Create professional designs using tools like Adobe Illustrator and Photoshop while building a strong design foundation.",
        tutor: "Emily Carter",
        image: course39,
        premiumRequired: true
      },
      {
        title: "UI/UX Design Essentials",
        description: "Design seamless user experiences",
        fullDescription: "Learn how to craft intuitive and visually appealing user interfaces. Understand the design thinking process, wireframing, prototyping, and usability testing using tools like Figma and Adobe XD.",
        tutor: "Liam Foster",
        image: course40,
        premiumRequired: true
      },
      {
        title: "Adobe Photoshop for Designers",
        description: "Edit like a pro with Photoshop",
        fullDescription: "Unlock the full potential of Adobe Photoshop for creative design. From image retouching and manipulation to creating banners and digital illustrations, this course guides you through real-world design projects.",
        tutor: "Sophia Lin",
        image: course41,
        premiumRequired: true
      },
      {
        title: "Canva for Beginners",
        description: "Design stunning visuals easily",
        fullDescription: "Learn to create eye-catching social media posts, flyers, presentations, and more using Canva. This beginner-friendly course focuses on using templates, custom branding, and visual storytelling techniques.",
        tutor: "Noah Kim",
        image: course42,
        premiumRequired: true
      },
      {
        title: "Motion Graphics with After Effects",
        description: "Bring designs to life with animation",
        fullDescription: "Discover how to animate text, objects, and illustrations using Adobe After Effects. This course covers keyframes, effects, transitions, and exporting animations for web and video platforms.",
        tutor: "Isabella Nguyen",
        image: course43,
        premiumRequired: true
      }

    ]
  }
];

const filteredCourses = computed(() => {
  return categorizedCourses
    .map(group => {
      if (selectedCategory.value && !group.category.includes(selectedCategory.value)) return null;

      const filteredGroupCourses = group.courses.filter(course => {
        const search = searchQuery.value.toLowerCase();
        return (
          course.title.toLowerCase().includes(search) ||
          course.description.toLowerCase().includes(search) ||
          course.tutor.toLowerCase().includes(search)
        );
      });

      if (filteredGroupCourses.length > 0) {
        return {
          category: group.category,
          courses: filteredGroupCourses
        };
      }
      return null;
    })
    .filter(Boolean);
});

</script>

<style>
.courses-container {
  padding: 3rem 1.5rem;
  background-color: #f4f6f8;
  max-width: 1400px;
  margin: auto;
  transition: background-color 0.5s ease, color 0.5s ease;
}

.section-heading {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 3rem;
}

.category-section {
  margin-bottom: 4rem;
}

.category-heading {
  font-size: 1.75rem;
  width: 21%;
  background-color: white;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.25rem;
  padding-left: 0.75rem;
  border-left: 4px solid #6366f1;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 2rem;
}

.course-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
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
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}


.premium-label {
  position: absolute;
  top: -20px;
  right: 0px;
  background-color: rgba(0, 0, 0, 0.416);
  font-size: 20px;
  padding: 4px 8px;
}

.course-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.course-description {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.course-description1 {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.course-tutor {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 1rem;
}

.enroll-button {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.enroll-button:hover {
  background-color: #4338ca;
}

@media (max-width: 640px) {
  .section-heading {
    font-size: 1.75rem;
  }

  .category-heading {
    font-size: 1.4rem;
  }

  .course-title {
    font-size: 1rem;
  }

  .enroll-button {
    width: 100%;
    text-align: center;
  }
}

.back-button {
  position: fixed;
  display: flex;
  margin-top: -20px;
  margin-left: -1rem;
  background-color: #f4f6f8b3;
  color: rgba(0, 0, 0, 0.647);
  padding: 8px 5px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.back-button:hover {
  background-color: #00bbd4;
  color: white;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1.5rem;
  border-radius: 5px;
}

.filter-section {
  margin-left: 30rem;
}

.highlight {
  background-color: yellow;
  font-weight: bold;
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

.close-btn1 {
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

.close-btn1:hover {
  color: #e74c3c;
}

.category-btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.category-btn:hover {
  background-color: #3730a3;
}

.category-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.category-popup {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.category-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.category-list li button {
  margin: 8px 0;
  padding: 10px 20px;
  background: #1e90ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

.clear-btn {
  margin-left: 10px;
  background-color: #f87171;
  /* red-400 */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

.user-actions {
  align-items: center;
  gap: 1rem;
  padding: 12px 20px;
  border-radius: 8px;
  font-family: 'Segoe UI', sans-serif;
  margin-left: 68.5rem;
}

.user-actions span {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
}

.cancel-subscription-btn {
  background-color: #ef4444;
  position: fixed;
  margin-top: -30px;
  margin-left: 6rem;
  color: #ffffff;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.cancel-subscription-btn:hover {
  background-color: #dc2626;
  /* red-600 */
}

/* Premium Style Overrides */
.premium-active {
  background-color: #0f172a;
  /* dark background */
  color: #facc15;
  /* golden text */
}

.premium-active .category-heading {
  color: #facc15;
  border-left-color: #facc15;
  background-color: #1e293b;
}

.premium-active .section-heading {
  color: #facc15;
  border-left-color: #facc15;
}

.premium-active .course-card {
  background-color: #1e293b;
  border: 2px solid #facc15;
  box-shadow: 0 4px 10px rgba(250, 204, 21, 0.3);
}

.premium-active .enroll-button {
  background-color: #facc15;
  color: #1e293b;
  font-weight: bold;
  border: none;
  transition: transform 0.2s ease-in-out;
}

.premium-active .enroll-button:hover {
  transform: scale(1.05);
}

.premium-active .course-title,
.premium-active .course-tutor,
.premium-active .course-description {
  color: #e2e8f0;
}

.premium-active .highlight {
  color: #0f172a;
}

.premium-active .course-description1 {
  color: #555555;
}

.premium-active .premium-label {
  color: #facc15;
}</style>