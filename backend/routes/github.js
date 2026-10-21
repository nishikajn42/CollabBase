const express = require('express');
const router = express.Router();

// GET /api/github/analyze/:username
router.get('/analyze/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // 1. Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) return res.status(404).json({ error: "GitHub user not found." });
    const userData = await userRes.json();

    // 2. Fetch Public Repositories (Up to 100)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const reposData = await reposRes.json();

    // 3. Calculate Totals and Top Languages
    let totalStars = 0;
    const languageCounts = {};

    if (Array.isArray(reposData)) {
      reposData.forEach(repo => {
        totalStars += repo.stargazers_count || 0;
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
      });
    }

    const totalLangsCount = Object.values(languageCounts).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        percent: Math.round((count / (totalLangsCount || 1)) * 100)
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);

    res.status(200).json({
      username: userData.login,
      name: userData.name,          // NEW: Added for dashboard display
      avatar: userData.avatar_url,  // NEW: Added for dashboard display
      bio: userData.bio,            // NEW: Added for dashboard display
      publicRepos: userData.public_repos,
      followers: userData.followers,
      totalStars,
      topLanguages
    });

  } catch (error) {
    console.error("GitHub API Error:", error);
    res.status(500).json({ error: "Failed to fetch GitHub data." });
  }
});

module.exports = router;