const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/Users');
const Admin = require('./models/Admin');
const Enrollment = require('./models/Enrollment');
const Message = require('./models/Message');
const GroupMessage = require('./models/GroupMessage');
const Group = require('./models/Group');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = 5001;


app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5175',                 // dev
    'e-learning-online1.netlify.app'          // production
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB Connection
mongoose.connect('mongodb+srv://kabeerkumar577:9510Kabeer@cst2120.ppvcmnk.mongodb.net/E-learning')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@gmail.com') {
    return res.status(403).json({ message: 'Please use the admin login page' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({
      message: 'Login successful',
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

app.post('/admin-register', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email.endsWith('@admin.com')) {
    return res.status(400).json({ message: 'Only @admin.com emails are allowed for admin registration' });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(409).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ fullName, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during admin registration', error: err.message });
  }
});

app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({
      message: 'Admin login successful',
      email: admin.email,
      fullName: admin.fullName,
      profileImage: admin.profileImage || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during admin login', error: err.message });
  }
});

// Profile Image Upload (Admin & User)
app.post('/upload-profile', async (req, res) => {
  const { email, profileImage } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileImage = profileImage;
    await user.save();

    res.status(200).json({ message: 'Profile image updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error while uploading profile image' });
  }
});

app.post('/admin/upload-profile', async (req, res) => {
  const { email, profileImage } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    admin.profileImage = profileImage;
    await admin.save();

    res.status(200).json({ message: 'Admin profile image updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating admin profile image', error: err.message });
  }
});

// Get Profile
app.post('/get-profile', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      fullName: user.fullName,
      profileImage: user.profileImage || null
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

app.post('/admin/get-profile', async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    res.status(200).json({
      profileImage: admin.profileImage || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving admin profile image', error: err.message });
  }
});

// Fetch All Users (Admin Dashboard)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    console.log('Fetched users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.get('/api/users-with-courses', async (req, res) => {
  try {
    const users = await User.find();

    const usersWithCourses = await Promise.all(
      users.map(async (user) => {
        const enrollments = await Enrollment.find({ email: user.email });
        const courses = enrollments.map(e => ({
          title: e.course.title,
          image: e.course.image
        }));

        return {
          fullName: user.fullName,
          email: user.email,
          profileImage: user.profileImage || null,
          courses
        };
      })
    );

    res.json(usersWithCourses);
  } catch (err) {
    console.error('Error fetching users with courses:', err);
    res.status(500).json({ message: 'Error fetching users with course details' });
  }
});
app.post('/enroll-course', async (req, res) => {
  const { fullName, email, courseTitle, courseImage } = req.body;

  try {
    // Check if already enrolled
    const existing = await Enrollment.findOne({
      email,
      'course.title': courseTitle,
    });

    if (existing) {
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }

    const newEnrollment = new Enrollment({
      fullName,
      email,
      course: {
        title: courseTitle,
        image: courseImage,
      },
      date: new Date()
    });

    await newEnrollment.save();
    res.status(201).json({ message: 'Course enrolled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Enrollment failed', error: err.message });
  }
});

app.get('/api/mycourses', async (req, res) => {
  const email = req.query.email;

  try {
    const userCourses = await Enrollment.find({ email });

    const uniqueCourses = [];
    const seenTitles = new Set();

    for (const c of userCourses) {
      if (!seenTitles.has(c.course.title)) {
        uniqueCourses.push(c);
        seenTitles.add(c.course.title);
      }
    }

    res.json(uniqueCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

app.get('/fetchusers', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Fetch all admins
app.get('/fetchadmins', async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.post('/send-message', async (req, res) => {
  console.log("📥 Received in backend:", req.body);

  const { senderEmail, receiverEmail, message } = req.body;

  if (!senderEmail || !receiverEmail || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const newMessage = new Message({
      senderEmail,
      receiverEmail,
      message,
      timestamp: new Date(),
      isRead: false
    });

    const saved = await newMessage.save();
    res.status(200).json({ success: true, message: 'Message sent successfully', data: saved });
  } catch (err) {
    console.error('❌ Message save error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/get-messages', async (req, res) => {
  const { sender, receiver } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { senderEmail: sender, receiverEmail: receiver },
        { senderEmail: receiver, receiverEmail: sender }
      ]
    }).sort({ timestamp: 1 });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/get-unread-count', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // ✅ Use Mongoose model `Message` instead of db.collection
    const getunreadCount = await Message.countDocuments({
      receiverEmail: email,
      read: false
    });

    res.json({ getunreadCount });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/mark-read', async (req, res) => {
  const { senderEmail, receiverEmail } = req.body;
  try {
    await Message.updateMany(
      { sender: senderEmail, receiverEmail, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/unread-count", async (req, res) => {
  const { receiverEmail, senderEmail } = req.query;

  if (!receiverEmail) {
    return res.status(400).json({ error: "Missing receiverEmail" });
  }

  const filter = { receiverEmail, read: false };
  if (senderEmail) {
    filter.sender = senderEmail;
  }

  try {
    const count = await Message.countDocuments(filter);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/mark-messages-read', async (req, res) => {
  const { receiverEmail } = req.body
  if (!receiverEmail) {
    return res.status(400).json({ error: 'receiverEmail is required' })
  }

  try {
    await Message.updateMany(
      { receiverEmail: receiverEmail, read: false },
      { $set: { read: true } }
    )
    res.json({ message: 'Messages marked as read' })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/get-messages-between', async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const messages = await Message.find({
      $or: [
        { senderEmail: user1, receiverEmail: user2 },
        { senderEmail: user2, receiverEmail: user1 }
      ]
    }).sort({ timestamp: 1 });

    // ✅ Mark messages from user2 -> user1 as read
    await Message.updateMany(
      { senderEmail: user2, receiverEmail: user1, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

app.post('/get-unread-messages', async (req, res) => {
  const { email } = req.body;

  try {
    const unreadMessages = await Message.find({
      receiverEmail: email,
      isRead: false
    }).sort({ timestamp: -1 });

    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

app.post('/api/groups', async (req, res) => {
  const { name, description, createdBy, members } = req.body;

  try {
    const existing = await Group.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Group already exists' });

    const group = new Group({
      name,
      description,
      createdBy,
      members
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', group });
  } catch (err) {
    res.status(500).json({ message: 'Error creating group', error: err.message });
  }
});

// Add a user to a group
app.post('/api/groups/:groupId/add', async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(userId)) {
      return res.status(409).json({ message: 'User already in group' });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({ message: 'User added to group', group });
  } catch (err) {
    res.status(500).json({ message: 'Error adding user to group', error: err.message });
  }
});

// Remove a user from a group
app.post('/api/groups/:groupId/remove', async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();

    res.status(200).json({ message: 'User removed from group', group });
  } catch (err) {
    res.status(500).json({ message: 'Error removing user from group', error: err.message });
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const email = req.query.email;
    console.log('--- GET /api/groups called ---');
    console.log('Query email:', email);

    let groups;
    if (email) {
      groups = await Group.find({ createdBy: email });
      console.log(`Groups fetched for user ${email}:`, groups);
    } else {
      groups = await Group.find();
      console.log('All groups fetched:', groups);
    }

    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/upload-group-profile', async (req, res) => {
  const { groupId, profileImage } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.profileImage = profileImage;
    await group.save();

    res.status(200).json({ message: 'Group profile image updated successfully' });
  } catch (err) {
    console.error('Error uploading group profile:', err);
    res.status(500).json({ message: 'Server error while uploading group profile image' });
  }
});

app.post("/send-group-message", async (req, res) => {
  console.log("Incoming group message request body:", req.body);

  const { senderEmail, message, groupId, timestamp } = req.body;

  if (!senderEmail || !message) {
    return res.status(400).json({ error: "senderEmail and message are required." });
  }

  try {
    const newMessage = new GroupMessage({
      senderEmail,
      message,
      groupId,
      date: timestamp || Date.now()
    });

    await newMessage.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error sending group message:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/group-messages/:groupId', async (req, res) => {
  try {
    const messages = await GroupMessage.find({ groupId: req.params.groupId });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch group messages' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});