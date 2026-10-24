const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Generate AI Icebreaker
router.post('/generate-icebreaker', async (req, res) => {
  try {
    // Frontend will pass who is sending, who is receiving, and what post they are looking at
    const { senderId, receiverId, postId } = req.body;

    // 1. Gather Live Data
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    const post = await Post.findById(postId);

    if (!sender || !receiver || !post) {
      return res.status(404).json({ error: "Missing required context data" });
    }

    // 2. The Contextual Prompt (The Core Engine)
    const prompt = `
      You are an AI assistant helping a user write a professional networking intro message.
      Sender: ${sender.name}, Tagline: ${sender.tagline || 'Student/Developer'}, GitHub: ${sender.githubUsername || 'Not linked'}.
      Receiver: ${receiver.name}.
      Context: Sender is reaching out regarding Receiver's post: "${post.content}".
      
      Write a 3-sentence direct message from the Sender to the Receiver. 
      If the Sender's tagline/skills match the post, highlight them naturally. 
      If they seem like a beginner, make them express eagerness to learn through practical project experience.
      Keep it professional, human, and concise. Do NOT use placeholders like [Your Name], use the provided names.
    `;

    // 3. Call Gemini API Directly
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini Error:", data);
      return res.status(500).json({ error: "AI Generation failed" });
    }

    // 4. Send back the draft (Do NOT save to DB yet, the user must review/edit it first)
    const draftText = data.candidates[0].content.parts[0].text;
    res.json({ draft: draftText });

  } catch (error) {
    console.error("Icebreaker Error:", error);
    res.status(500).json({ error: "Server error generating icebreaker" });
  }
});

// Save the final sent message
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    
    // 1. Check if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    // 2. If not, create a new conversation room
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    // 3. Save the actual message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      text: text
    });

    // 4. Update the conversation's latest snippet for the left-pane directory
    conversation.lastMessage = text;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Fetch all conversations for a user (For the Left Pane Directory)
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId
    })
    .populate('participants', 'fullName handle profilePicture tagline')
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Fetch Conversations Error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Fetch all messages for a specific conversation (For the Right Pane Canvas)
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
    .populate('sender', 'fullName handle profilePicture')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// 1. Analyze Match ("Why this person?")
router.post('/analyze-match', async (req, res) => {
  try {
    const { postId, candidateId } = req.body;
    const post = await Post.findById(postId);
    const candidate = await User.findById(candidateId);

    const prompt = `
      Analyze why this candidate is a good fit for this post.
      Post Requirements: "${post.content}"
      Candidate Profile: Skills: ${candidate.skills?.join(', ')}, Interests: ${candidate.interests?.join(', ')}, GitHub Username: ${candidate.githubUsername}.
      Write a 2-sentence summary explaining the match percentage (e.g., "75% match") and specifically mentioning their overlapping skills or projects. Keep it analytical and objective.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    res.json({ matchAnalysis: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

// 2. Generate Author-to-Candidate Icebreaker
router.post('/generate-author-icebreaker', async (req, res) => {
  try {
    const { authorId, candidateId, postId } = req.body;
    const author = await User.findById(authorId);
    const candidate = await User.findById(candidateId);
    const post = await Post.findById(postId);

    const prompt = `
      You are ${author.name}. You wrote a post looking for teammates: "${post.content}".
      You want to recruit ${candidate.name} who has skills in: ${candidate.skills?.join(', ')}.
      Write a 3-sentence outreach message. Acknowledge their specific skills or GitHub work, explain you are building a project in their domain, and invite them to collaborate. If you are a beginner, mention you are looking to learn alongside experienced people. Keep it human and professional.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    res.json({ draft: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "Icebreaker generation failed" });
  }
});

module.exports = router;