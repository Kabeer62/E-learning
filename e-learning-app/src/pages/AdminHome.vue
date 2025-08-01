<template>
    <MyCourses v-if="showMyCoursesPage" @go-back="showMyCoursesPage = false" />
    <Users v-if="showUsersPage" @go-back="showUsersPage = false" />
    <div v-if="!showMyCoursesPage && !showUsersPage">
        <nav class="navbar">
            <div class="brand">
                <img :src="icon" alt="Icon" class="brand-logo" />
            </div>
            <div class="profile-wrapper">
                <div class="notification-icon" @click="openNotifications">
                    <i class="fas fa-bell"></i>
                    <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
                </div>
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

            <button v-if="isAdmin" class="upload-videos-button" @click="uploadLessonVideo">
                <i class="fas fa-upload"></i>
                <span>Upload Lesson Video</span>
            </button>
            <button class="logout-button" @click="logout">
                <span>Logout</span>
                <i></i>
            </button>
        </div>

        <div class="admin-container">
            <section class="welcome-banner">
                <h1 class="greeting">Welcome, Admin {{ userName }} 👋</h1>
                <p class="subtext">Here’s a quick look at today’s platform stats.</p>
            </section>
        </div>

        <div v-if="!isChatCardVisible" class="admin-card" :class="{ expanded: isMessagesCardExpanded }">
            <img v-if="profileImage" :src="profileImage" class="admin-avatar" alt="Admin" />
            <i v-else class="fas fa-user admin-avatar"></i>

            <h2 class="admin-messages">Messages</h2>
            <template v-if="messageMode === 'group' && hasGroups">
                <button class="icon-button create-group-icon" @click="toggleGroupPopup">
                    <i class="fas fa-users"></i>
                </button>
            </template>
            <!-- User/Group Toggle Buttons -->
            <div class="toggle-buttons">
                <button :class="{ active: messageMode === 'user' }" @click="setMessageMode('user')">User</button>
                <button :class="{ active: messageMode === 'group' }" @click="setMessageMode('group')">Group</button>
            </div>

            <!-- Conditionally show User or Group UI -->
            <template v-if="messageMode === 'user'">
                <!-- Search Bar -->
                <div class="search-container">
                    <template v-if="showSearchInput">
                        <input type="text" class="search-input" placeholder="Search..." v-model="searchQuery"
                            @input="filterUsers" />
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
            </template>

            <template v-else-if="messageMode === 'group'">
                <div class="group-mode-container">
                    <!-- Visible only if NO groups -->
                    <template v-if="!hasGroups">
                        <button class="create-group-btn" @click="toggleGroupPopup">
                            <i class="fas fa-users"></i>
                            Create Group
                        </button>
                    </template>

                    <!-- Show created groups -->
                    <div class="group-result" v-for="group in createdGroups" :key="group._id"
                        @click="openGroupChat(group)">
                        <div class="group-avatar" @click="triggerGroupImageUpload(group)">
                            <img v-if="group.profileImage" :src="group.profileImage" class="group-icon-img" />
                            <i v-else class="fas fa-users group-icon"></i>
                            <input type="file" :ref="el => setGroupInputRef(el, group._id)"
                                @change="handleGroupImageUpload($event, group)" accept="image/*"
                                style="display: none;" />
                        </div>
                        <span class="group-name">{{ group.name }}</span>
                    </div>
                </div>
            </template>

            <button class="arrow-up" @click="toggleMessagesCard">
                <i :class="['fas', isMessagesCardExpanded ? 'fa-chevron-down' : 'fa-chevron-up']"></i>
                <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
            </button>
        </div>

        <div v-if="showGroupPopup && !showGroupDetailsPage" class="overlay">
            <div class="group-popup">
                <button class="close-btn" @click="toggleGroupPopup">
                    <i class="fas fa-arrow-left"></i></button>
                <button class="next-btn" :disabled="selectedUsers.length === 0" @click="goToGroupDetailsPage">
                    Next
                </button>
                <h3>Add Members</h3>

                <!-- Search Bar -->
                <div class="search-container1">
                    <template v-if="showSearchInput">
                        <input type="text" class="search-input" placeholder="Search users..." v-model="searchQuery"
                            @input="filterUsers" />
                        <i class="fas fa-search search-input-icon"></i>
                    </template>
                    <template v-else>
                        <i class="fas fa-search search-icon" @click="toggleSearchInput"></i>
                    </template>
                </div>
                <!-- Selected Users Preview -->
                <div class="selected-users-container" v-if="selectedUsers.length > 0">
                    <div class="selected-user" v-for="user in selectedUsers" :key="user._id">
                        <button class="remove-user-btn" @click="removeUser(user._id)">x</button>
                        <img :src="user.profileImageUrl" alt="User" class="selected-user-img" />
                        <span class="selected-user-name">{{ user.username }}</span>
                    </div>
                </div>

                <!-- Search Results -->
                <div class="search-results1">
                    <div class="user-result1" v-for="user in displayedUsers" :key="user._id">
                        <img :src="user.profileImageUrl" alt="User Image" class="user-image1" />
                        <span class="username1">{{ user.username }}</span>
                        <button class="add-btn" @click="addUser(user)">Add</button>
                    </div>
                </div>
            </div>
        </div>

        <transition name="slide-left">
            <div v-if="showGroupDetailsPage" class="group-details-page">
                <!-- Top bar with Back, Title, and Create -->
                <div class="group-details-topbar">
                    <button class="back-btn" @click="backToGroupPopup">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <span class="group-details-title">New Group</span>
                    <button class="create-btn" @click="createGroup">Create</button>
                </div>

                <!-- Group Header Section -->
                <div class="group-header">
                    <div class="group-photo-wrapper">
                        <div class="photo-circle">
                            <i class="fas fa-camera"></i>
                        </div>
                    </div>
                    <div class="group-name-field">
                        <i class="fas fa-users group-icon"></i>
                        <input type="text" class="group-name-input" placeholder="Group name (optional)"
                            v-model="groupName" />
                    </div>
                </div>

                <!-- ✅ Members Section -->
                <div class="group-members-section p-4">
                    <h3 class="Members">Members:</h3>
                    <div class="flex flex-wrap gap-4">
                        <div class="selected-users-container1" v-if="selectedUsers.length > 0">
                            <div class="selected-user" v-for="user in selectedUsers" :key="user._id">
                                <button class="remove-user-btn" @click="removeUser(user._id)">x</button>
                                <img :src="user.profileImageUrl" alt="User" class="selected-user-img" />
                                <span class="selected-user-name">{{ user.username }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Add more group customization fields here if needed -->
            </div>
        </transition>

        <div v-if="isChatCardVisible">
            <template v-if="selectedUser || selectedGroup">
                <div class="chat-card">
                    <div class="chat-header">
                        <img v-if="selectedUser" :src="selectedUser.profileImageUrl || defaultProfile" alt="User Image"
                            class="chat-user-image" />
                        <i v-else class="fas fa-users group-icon chat-user-image"></i>

                        <span class="chat-username">
                            {{ selectedUser ? selectedUser.username : selectedGroup.name }}
                        </span>

                        <button class="close-chat-btn" @click="closeChat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="chat-body">
                        <div v-for="msg in messages" :key="msg.timestamp"
                            :class="['message-wrapper', msg.senderEmail === userEmail ? 'sent' : 'received']">
                            <div :class="messageClass(msg)">
                                <div>{{ msg.message }}</div>
                                <small class="timestamp">{{ formatTimestamp(msg.timestamp) }}</small>
                            </div>
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
                    Select a user or group to send message.
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import axios from 'axios'
import Users from './Users.vue'
import MyCourses from './MyCourses.vue'
import icon from '../assets/images/icon.png'
import { computed } from 'vue'

let unreadInterval = null;
const showMyCoursesPage = ref(false)
const showUsersPage = ref(false)
const isDashboardVisible = ref(false)
const profileImage = ref(localStorage.getItem('profileImage') || null)
const userName = ref(localStorage.getItem('fullName') || 'Guest')
const userEmail = ref(localStorage.getItem('email') || '')
const email = userEmail.value
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true')
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
const adminData = ref({});
const newMessage = ref('');
const messageMode = ref('user')
const showGroupPopup = ref(false);
const selectedUsers = ref([]);
const showGroupDetailsPage = ref(false);
const groupName = ref('');
const createdGroups = ref([]);
const selectedGroup = ref(null)
const hasGroups = computed(() => createdGroups.value.length > 0)
const groupImageInputs = ref({});


function setGroupInputRef(el, groupId) {
    if (el) {
        groupImageInputs.value[groupId] = el;
    }
}

function triggerGroupImageUpload(group) {
    const inputEl = groupImageInputs.value[group._id];
    if (inputEl && typeof inputEl.click === 'function') {
        inputEl.click();
    } else {
        console.warn('No input element found for group:', group._id);
    }
}

async function handleGroupImageUpload(event, group) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("groupId", group._id);

    try {
        const res = await fetch("http://localhost:5001/upload-group-profile", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();

        if (data.success) {
            group.profileImage = data.imageUrl; // Update local image immediately
            console.log("Group profile updated");
        }
    } catch (err) {
        console.error("Error uploading group image:", err);
    }
}

function openGroupChat(group) {
    selectedUser.value = null;
    selectedGroup.value = group;
    chatMessage.value = '';  // assuming this is the message input
    isChatCardVisible.value = true;
    fetchGroupMessages(group._id);
}

function fetchGroupMessages(groupId) {
    // Fetch messages from backend or DB, example:
    // axios.get(`/api/messages/group/${groupId}`).then(res => {
    //   messages.value = res.data
    // })
    messages.value = []
}

function closeChat() {
    selectedUser.value = null
    selectedGroup.value = null
    isChatCardVisible.value = false
}

const goToGroupDetailsPage = () => {
    showGroupDetailsPage.value = true;
};

const backToGroupPopup = () => {
    showGroupPopup.value = true;
    showGroupDetailsPage.value = false;
};

function addUser(user) {
    if (!selectedUsers.value.find(u => u._id === user._id)) {
        selectedUsers.value.push(user);
    }
}

function removeUser(userId) {
    selectedUsers.value = selectedUsers.value.filter(u => u._id !== userId);
}

const toggleGroupPopup = () => {
    showGroupPopup.value = !showGroupPopup.value;
};

const setMessageMode = (mode) => {
    messageMode.value = mode;
};

// ✅ Now safely use watchers
watch(isDashboardVisible, (val) => {
    localStorage.setItem('isDashboardVisible', val)
})

watch(showUsersPage, (val) => {
    localStorage.setItem('showUsersPage', val)
})

watch(showMyCoursesPage, (val) => {
    localStorage.setItem('showMyCoursesPage', val)
})

watch(isChatCardVisible, (val) => {
    localStorage.setItem('isChatCardVisible', val)
})

watch(selectedUser, (val) => {
    if (val) localStorage.setItem('selectedUser', JSON.stringify(val))
    else localStorage.removeItem('selectedUser')
})

watch(selectedGroup, (val) => {
    if (val) localStorage.setItem('selectedGroup', JSON.stringify(val));
    else localStorage.removeItem('selectedGroup');
});

const openChatCard = (user) => {
    selectedUser.value = user
    isChatCardVisible.value = true
    isMessagesCardExpanded.value = false
    if (messageMode.value === 'user') {
        fetchMessages()
    }
}

const getUnreadCount = (user) => {
    const senderMessages = messages.value.filter(msg =>
        msg.sender === user.email &&
        msg.receiver === email &&
        !msg.read // or use msg.status === 'unread' based on your schema
    );
    return senderMessages.length;
}


const sendThumbsUp = () => {
    chatMessage.value = "👍";
    sendMessage();

    if (messageMode.value === 'group' && selectedGroup.value?.name) {
        sendToGroup(selectedGroup.value.name, "👍");
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

    if (messageMode.value === 'user') {
        if (!selectedUser.value || !selectedUser.value.email) {
            alert("Select a user to send message.");
            return;
        }

        const payload = {
            senderEmail: userEmail.value,
            receiverEmail: selectedUser.value.email,
            message: chatMessage.value.trim(),
            timestamp: new Date().toISOString(),
        };

        try {
            await axios.post('http://localhost:5001/send-message', payload);
            messages.value.push(payload);
            chatMessage.value = '';
        } catch (error) {
            console.error("Failed to send message:", error.response?.data || error.message);
            alert('Failed to send message. Please try again.');
        }

    } else if (messageMode.value === 'group') {
        if (!selectedGroup.value || !selectedGroup.value._id) {
            alert("Select a group to send message.");
            return;
        }

        const payload = {
            senderEmail: userEmail.value,
            groupId: selectedGroup.value._id,
            message: chatMessage.value.trim(),
            timestamp: new Date().toISOString(),
        };

        try {
            console.log("Payload being sent to backend:", payload);
            await axios.post('http://localhost:5001/send-group-message', payload);
            messages.value.push(payload);
            chatMessage.value = '';
            alert('Message sent to group.');
        } catch (err) {
            console.error("Failed to send message:", err.response?.data || err.message);
            alert('Failed to send message. Please try again.');
        }
    }
};

const createGroup = async () => {
    if (!groupName.value.trim()) {
        alert('Please enter a group name.');
        return;
    }

    const groupData = {
        name: groupName.value.trim(),
        description: 'AI development group',
        createdBy: email,
        members: selectedUsers.value.map(user => user._id)
    };

    try {
        const res = await axios.post('http://localhost:5001/api/groups', groupData);
        createdGroups.value.push(res.data.group);

        showGroupDetailsPage.value = false;
        showGroupPopup.value = false;
        selectedUsers.value = [];
        groupName.value = '';

        console.log("Group created and saved to MongoDB!", res.data.group);
    } catch (error) {
        console.error("Failed to create group:", error);
        alert('Failed to create group. Try again.');
    }
};

const fetchGroups = async () => {
    try {
        console.log('Fetching groups from API...')
        const res = await axios.get(`http://localhost:5001/api/groups?receiverEmail=${userEmail.value}`);
        createdGroups.value = res.data.groups || res.data || [];
        console.log("Fetched groups:", createdGroups.value);
    } catch (err) {
        console.error("Failed to fetch groups:", err);
    }
};

const fetchMessages = async () => {
    if (!userEmail.value || !selectedUser.value?.email) return;

    try {
        const res = await axios.post('http://localhost:5001/get-messages-between', {
            user1: userEmail.value,
            user2: selectedUser.value.email,
        });
        messages.value = res.data || [];

        // Mark messages as read
        await axios.post('http://localhost:5001/mark-messages-read', {
            senderEmail: selectedUser.value.email,
            receiverEmail: userEmail.value,
        });

        await fetchUnreadCount();
    } catch (error) {
        console.error("Failed to fetch messages:", error);
    }
};

const fetchUnreadCount = async () => {
    if (!userEmail.value) return;
    try {
        const res = await axios.get(`http://localhost:5001/unread-count?receiverEmail=${userEmail.value}`);
        if (res.data && typeof res.data.unreadCount === 'number') {
            unreadCount.value = res.data.unreadCount;
        }
    } catch (error) {
        console.error('Error fetching unread count:', error);
    }
};


const toggleSearchInput = () => {
    showSearchInput.value = !showSearchInput.value
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


const toggleMessagesCard = () => {
    fetchAllUsers();
    isMessagesCardExpanded.value = !isMessagesCardExpanded.value;

    if (isMessagesCardExpanded.value) {
        showSearchInput.value = true;
    } else {
        showSearchInput.value = false;
        searchQuery.value = "";        // Clear the search
        displayedUsers.value = [];     // Optionally clear results
    }
};

const toggleDashboard = () => {
    isDashboardVisible.value = !isDashboardVisible.value
}

const handleProfileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
        const imageUrl = reader.result
        profileImage.value = imageUrl
        localStorage.setItem('profileImage', imageUrl)

        const endpoint = isAdmin.value
            ? 'http://localhost:5001/admin/upload-profile'
            : 'http://localhost:5001/upload-profile'

        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: localStorage.getItem('email'), profileImage: imageUrl })
        })
    }
    reader.readAsDataURL(file)
}

const fetchUsers = async () => {
    showUsersPage.value = true
}

const handleMyCourses = () => {
    showMyCoursesPage.value = true
    isDashboardVisible.value = false
}

const logout = () => {
    localStorage.clear()
    window.location.reload()
}

onMounted(async () => {
    const email = localStorage.getItem('email');

    // Restore UI states
    isDashboardVisible.value = localStorage.getItem('isDashboardVisible') === 'true';
    showUsersPage.value = localStorage.getItem('showUsersPage') === 'true';
    showMyCoursesPage.value = localStorage.getItem('showMyCoursesPage') === 'true';
    isChatCardVisible.value = localStorage.getItem('isChatCardVisible') === 'true';

    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) selectedUser.value = JSON.parse(savedUser);

    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) selectedGroup.value = JSON.parse(savedGroup);

    const chatVisibleStored = localStorage.getItem('isChatCardVisible') === 'true';
    isChatCardVisible.value = chatVisibleStored || !!savedUser || !!savedGroup;

    // Sync state to localStorage when values change
    watch(isDashboardVisible, (val) => {
        localStorage.setItem('isDashboardVisible', val.toString());
    });

    watch(showUsersPage, (val) => {
        localStorage.setItem('showUsersPage', val.toString());
    });

    watch(showMyCoursesPage, (val) => {
        localStorage.setItem('showMyCoursesPage', val.toString());
    });

    watch(isChatCardVisible, (val) => {
        localStorage.setItem('isChatCardVisible', val.toString());
    });

    watch(selectedUser, (val) => {
        localStorage.setItem('selectedUser', JSON.stringify(val));
    });

    await fetchAllUsers();
    await fetchUnreadCount();
    await fetchMessages();
    await fetchGroups();

    if (email) {
        try {
            const endpoint = isAdmin.value
                ? 'http://localhost:5001/admin/get-profile'
                : 'http://localhost:5001/get-profile';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (data.profileImage) {
                profileImage.value = data.profileImage;
                localStorage.setItem('profileImage', data.profileImage);
            } else {
                profileImage.value = null;
                localStorage.removeItem('profileImage');
            }

            if (data.fullName) {
                userName.value = data.fullName;
                localStorage.setItem('fullName', data.fullName);
            }
        } catch (err) {
            console.error('Failed to load profile image:', err);
        }
    }

    // Animate hero elements
    await nextTick();
    document.querySelector('.hero-image')?.classList.add('slide-in');
    setTimeout(() => document.querySelector('.subtitle')?.classList.add('fade-in'), 1200);
    setTimeout(() => document.querySelector('.cta-button')?.classList.add('pop-in'), 1800);

    // Start polling unread count
    fetchUnreadCount();
    unreadInterval = setInterval(fetchUnreadCount, 10000);
});

onUnmounted(() => {
    clearInterval(unreadInterval)
})

const displayedUsers = computed(() => {
    return searchQuery.value
        ? filteredUsers.value
        : allUsers.value
})

function messageClass(msg) {
    return {
        'chat-message': true,
        'system-message': msg.isSystem || false,
    };
}

function formatTimestamp(ts) {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return 'Unknown time';

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function uploadLessonVideo() {
    // Placeholder logic — replace with your modal or upload route navigation
    alert("Upload Lesson Video clicked");
}

watch(isChatCardVisible, (val) => {
    if (val) {
        messageMode.value = 'user'
    }
})
</script>

<style>
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
    margin-top: 0rem;
    transition: background-color 0.3s ease;
}

.dashboard-btn:hover {
    background-color: #333;
}

.notification-icon {
    position: relative;
    margin-left: 77rem;
    margin-top: 0.5rem;
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
    background-color: rgba(0, 0, 0, 0.115) !important;
    padding: 20px;
    position: fixed;
    top: 60px;
    right: 0;
    width: fit-content !important;
    max-width: 90vw;
    overflow-wrap: break-word;
    word-break: break-word;
    height: calc(50% - 60px) !important;
    z-index: 20;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
    transform: translateX(0);
}

.dashboard-container.hidden {
    transform: translateX(100%);
}

.dashboard-container.v-enter-active,
.dashboard-container.v-leave-active {
    transition: transform 0.3s ease-in-out;
}

.dashboard-container.v-enter,
.dashboard-container.v-leave-to {
    transform: translateX(100%);
}

.dashboard-container.v-enter-to,
.dashboard-container.v-leave {
    transform: translateX(0);
}

.container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1;
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
    background: rgba(138, 138, 138, 0.233);
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
    color: rgb(0, 0, 0);
    transition: background 0.2s;
}

.edit-profile-label:hover {
    background-color: #0000007e;
    color: rgb(255, 255, 255);
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
    box-shadow: 0 4px 12px #000000;
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

.brand-logo {
    width: 50px;
    height: 50px;
}

.profile-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.profile-pic {
    width: 40px;
    height: 40px;
    border-radius: 50%;
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
    color: rgb(0, 0, 0);
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
    color: black;
    transition: background 0.2s, color 0.2s;
}

.users-button i {
    font-size: 1.2rem;
}

.users-button:hover {
    background-color: #0000007e;
    color: rgb(255, 255, 255);
    border-radius: 20%;
}

.admin-container {
    margin-top: -1rem;
    padding-top: 15rem;
    background-color: #f9fafb;
    min-height: 70vh;
}

.welcome-banner {
    background-color: #ffffff;
    padding: 1.5rem 2rem;
    width: 30rem;
    margin-left: 25rem;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    text-align: center;
}

.greeting {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.subtext {
    font-size: 1.1rem;
    color: #555;
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
    align-items: start;
    justify-content: space-between;
    padding: 16px;
    transition: height 0.3s ease, padding 0.3s ease;
    overflow-y: auto;
}

.admin-card.expanded .admin-avatar {
    width: 50px;
    height: 50px;
    transition: all 0.3s ease;
}

.admin-card.expanded .admin-messages {
    font-size: 18px;
    margin-left: 12px;
    font-weight: 700;
    transition: all 0.3s ease;
}

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

.search-container {
    position: fixed;
    margin-top: 7rem;
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
    top: 10px;
    right: 15px;
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
    margin-top: 10rem;
    margin-left: -19.2rem;
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
    color: #007bff;
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

.message-wrapper {
    display: flex;
    width: 100%;
}

.message-wrapper.sent {
    justify-content: flex-end;
}

.message-wrapper.received {
    justify-content: flex-start;
}

.chat-message {
    margin: 8px;
    padding: 10px;
    border-radius: 10px;
    max-width: 70%;
    word-wrap: break-word;
    display: flex;
    flex-direction: column;
    position: relative;
}

.chat-message .timestamp {
    font-size: 0.6rem;
    color: #555;
    margin-top: 5px;
    align-self: flex-end;
    opacity: 0.8;
}

.message-wrapper.sent .chat-message {
    background-color: #daf1da;
    text-align: right;
}

.message-wrapper.received .chat-message {
    background-color: #f1f1f1;
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

.upload-videos-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: -3rem;
    font-size: 1rem;
    background: none;
    border: none;
    gap: 10px;
    padding: 8px 12px;
    color: black;
    transition: background 0.2s, color 0.2s;
}

.upload-videos-button i {
    font-size: 1.2rem;
}

.upload-videos-button:hover {
    background-color: #0000007e;
    color: rgb(255, 255, 255);
    border-radius: 20%;
}

.toggle-buttons {
    display: flex;
    justify-content: center;
    gap: 0.1rem;
    margin-left: -10rem;
    margin-bottom: -5rem;
    margin-top: 4rem;
}

.toggle-buttons button {
    padding: 6px 59px;
    border: none;
    border-radius: 6px;
    background-color: #f0f0f0;
    color: #333;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
}

.toggle-buttons button.active {
    background-color: #007BFF;
    color: white;
}

.create-group-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-left: -13rem;
    margin-top: 15rem;
    padding: 10px 16px;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.create-group-btn:hover {
    background-color: #0056b3;
}

.create-group-icon {
    position: absolute;
    top: 30px;
    right: 50px;
    /* Adjust to sit beside arrow-up */
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #333;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

/* Popup container */
.group-popup {
    background-color: white;
    padding: 2rem;
    width: 400px;
    border-radius: 12px;
    position: relative;
    z-index: 1000;
}

.group-popup h3 {
    text-align: center;
    margin-top: -1rem;
}

.close-btn {
    right: 27rem;
    color: black;
    background: none;
    border: none;
    cursor: pointer;
}

.close-btn:hover {
    color: black;
}

.close-btn i {
    font-size: 1.2rem;
}

.next-btn {
    position: absolute;
    top: 0.7rem;
    right: 1rem;
    font-size: 16px;
    color: rgb(0, 191, 0);
    border: none;
    background-color: transparent;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    transition: opacity 0.3s;
}

.next-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: gray;
}

.add-btn {
    margin-left: auto;
    padding: 4px 10px;
    font-size: 12px;
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-results1 {
    width: 100%;
    margin-top: 10rem;
    margin-left: 0rem;
    padding: 0.5rem;
    background: none;
    border: 0px solid #ddd;
    border-radius: 0px;
    max-height: auto;
    overflow-y: auto;
    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.1);
}

.user-result1 {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.user-result1:last-child {
    border-bottom: none;
}

.user-image1 {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
}

.username1 {
    font-weight: 500;
    font-size: 1rem;
    color: #333;
}

.search-container1 {
    position: fixed;
    margin-top: 3rem;
    margin-left: 3rem;
    width: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50px;
}

.selected-users-container {
    background-color: white;
    padding: 1rem;
    margin-top: 8rem;
    margin-bottom: -8rem;
    border-radius: 10px;
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.selected-user {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
}

.selected-user-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.selected-user-name {
    font-size: 0.8rem;
    margin-top: 0.3rem;
    text-align: center;
}

.remove-user-btn {
    position: absolute;
    top: -5px;
    right: 17px;
    background-color: rgb(127, 127, 127);
    color: white;
    border: none;
    font-size: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
}

.slide-left-enter-active {
    transition: transform 0.4s ease;
}

.slide-left-leave-active {
    transition: transform 0.4s ease;
}

.slide-left-enter-from {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.group-details-page {
    position: fixed;
    top: 4.5rem;
    left: 30.4rem;
    width: 425px;
    height: 76.5%;
    background-color: rgb(230, 230, 230);
    border-radius: 2%;
    color: black;
    padding: 20px;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.group-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-top: 50px;
    background-color: white;
    padding: 6px 50px;
    border-radius: 10%;
    margin-bottom: 5rem;
}

.photo-circle {
    width: 60px;
    height: 60px;
    background-color: rgba(234, 234, 234, 0.662);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #808080;
    font-size: 20px;
}

.group-name-field {
    display: flex;
    align-items: center;
    gap: 10px;
}

.group-name-input {
    background: transparent;
    border: none;
    color: rgb(118, 118, 118);
    padding: 5px;
    font-size: 16px;
    outline: none;
}

.group-icon {
    color: rgba(148, 148, 148, 0.796);
}

.back-btn {
    position: absolute;
    right: 90%;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
}

.back-btn i {
    font-size: 1.2rem;
}

.create-btn {
    position: absolute;
    left: 85%;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
}

.group-details-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
    font-size: 1.1rem;
}

.selected-users-container1 {
    position: fixed;
    padding: 1rem;
    margin-top: 2rem;
    margin-bottom: -8rem;
    margin-left: -10rem;
    border-radius: 10px;
    max-height: 200px;
    width: 25%;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.selected-users-container1>div {
    flex: 0 0 calc(25% - 1rem);
    box-sizing: border-box;
}

.group-members-section img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.group-members-section button {
    position: absolute;
    top: -5px;
    right: 17px;
    background-color: rgb(127, 127, 127);
    color: white;
    border: none;
    font-size: 12px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
}

.font-medium {
    top: 21.5rem;
    left: 1.6rem;
}

.group-avatar i {
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    background-color: #ddd;
    border-radius: 50%;
    font-size: 18px;
}

.group-result {
    margin-left: -17.7rem;
    border-bottom: 1px solid rgba(207, 207, 207, 0.855);
    margin-top: 7rem;
    margin-bottom: -6rem;
}

.group-name {
    position: relative;
    left: 4.2rem;
    top: -1.7rem;
}
</style>