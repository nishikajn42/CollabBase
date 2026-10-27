const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const generateAIContent = async (prompt) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
};

router.post('/suggest-candidates', async (req, res) => {
  try {
    const { postId, authorId } = req.body;
    const post = await Post.findById(postId);
    const users = await User.find({ _id: { $ne: authorId } });
    const postTags = (post.tags || []).map(t => t.toLowerCase());
    
    const scoredUsers = users.map(u => {
        const uTags = [...(u.skills || []), ...(u.interests || [])].map(t => t.toLowerCase());
        const overlap = uTags.filter(t => postTags.includes(t)).length;
        return { ...u.toObject(), overlapScore: overlap };
    });
    scoredUsers.sort((a, b) => b.overlapScore - a.overlapScore);
    res.json(scoredUsers.slice(0, 10));
  } catch (error) { 
    console.error("❌ Suggest Candidates Error:", error);
    res.status(500).json({ error: "Failed to fetch candidates" }); 
  }
});

router.post('/generate-icebreaker', async (req, res) => {
  try {
    const { senderId, receiverId, postId } = req.body;
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    const post = await Post.findById(postId);
    const githubContext = sender.githubAnalysisCache ? `GitHub Stats: ${sender.githubAnalysisCache.publicRepos} repos. Top languages: ${sender.githubAnalysisCache.topLanguages?.map(l=>l.name).join(', ')}.` : 'No GitHub linked.';

    const prompt = `Write a highly personalized, 3-sentence professional outreach message from ${sender.fullName} to ${receiver.fullName}. Context: ${sender.fullName} is interested in collaborating on ${receiver.fullName}'s post: "${post.content}". Sender's Profile: Tagline: ${sender.tagline || 'Student/Developer'}. Skills: ${(sender.skills || []).join(', ')}. ${githubContext} Instructions: 1. Mention exactly why ${sender.fullName}'s skills or GitHub background makes them a good fit for this specific post. 2. If the sender lacks direct projects, state they are actively learning those skills and want practical experience. 3. Keep it human, confident, and direct. Do NOT use placeholders.`;

    res.json({ draft: await generateAIContent(prompt) });
  } catch (error) { 
    console.error("❌ Icebreaker Error:", error);
    res.status(500).json({ error: "Server error generating icebreaker" }); 
  }
});

router.post('/generate-author-icebreaker', async (req, res) => {
  try {
    const { authorId, candidateId, postId } = req.body;
    const author = await User.findById(authorId);
    const candidate = await User.findById(candidateId);
    const post = await Post.findById(postId);
    const githubContext = candidate.githubAnalysisCache ? `They have ${candidate.githubAnalysisCache.publicRepos} GitHub repos.` : '';

    const prompt = `Write a 3-sentence outreach message from ${author.fullName} to ${candidate.fullName}. Context: ${author.fullName} wrote a post looking for teammates: "${post.content}". They want to recruit ${candidate.fullName}. Candidate's Profile: Skills: ${(candidate.skills || []).join(', ')}. ${githubContext} Instructions: 1. Acknowledge ${candidate.fullName}'s specific skills or GitHub work. 2. Explain you are building a project in their domain and invite them to collaborate. 3. Do NOT use placeholders. Keep it natural and professional.`;

    res.json({ draft: await generateAIContent(prompt) });
  } catch (error) { 
    console.error("❌ Author Icebreaker Error:", error);
    res.status(500).json({ error: "Icebreaker generation failed" }); 
  }
});

router.post('/refine-icebreaker', async (req, res) => {
  try {
    const { currentDraft, instruction } = req.body;
    const prompt = `You are an AI writing assistant. The user has drafted this professional message: "${currentDraft}". Modify the message strictly based on this instruction: "${instruction}". Return ONLY the revised message text. Do not include introductory text, quotes, or conversational filler.`;
    res.json({ draft: await generateAIContent(prompt) });
  } catch (error) { 
    console.error("❌ Refine Error:", error);
    res.status(500).json({ error: "Refinement failed" }); 
  }
});

router.post('/analyze-match', async (req, res) => {
  try {
    const { postId, candidateId } = req.body;
    const post = await Post.findById(postId);
    const candidate = await User.findById(candidateId);
    const prompt = `Analyze why ${candidate.fullName} is a fit for this post. Post Requirements: "${post.content}" Candidate Profile: Skills: ${candidate.skills?.join(', ')}, Interests: ${candidate.interests?.join(', ')}. Write a 2-sentence summary explaining the match percentage (e.g., "75% match") and specifically mentioning their overlapping skills. Keep it analytical and objective.`;
    res.json({ matchAnalysis: await generateAIContent(prompt) });
  } catch (error) { 
    console.error("❌ Analyze Match Error:", error);
    res.status(500).json({ error: "Analysis failed" }); 
  }
});

router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
    if (!conversation) conversation = await Conversation.create({ participants: [senderId, receiverId] });
    const message = await Message.create({ conversationId: conversation._id, sender: senderId, text });
    conversation.lastMessage = text;
    await conversation.save();
    res.status(201).json(message);
  } catch (error) { res.status(500).json({ error: "Failed to send message" }); }
});

router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.params.userId }).populate('participants', 'fullName handle profilePicture tagline').sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) { res.status(500).json({ error: "Failed to fetch conversations" }); }
});

router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).populate('sender', 'fullName handle profilePicture').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ error: "Failed to fetch messages" }); }
});
module.exports = router;