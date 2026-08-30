import { judgeReadmeSchema } from '../schemas/judge.schema.js';
import { parseGithubUrl, fetchRepoReadme } from '../services/github.service.js';
import { generateRepoRoast } from '../services/ai/groq.service.js';
import { jaasSelfRoastVerdict } from '../services/ai/prompts.js';
import {
  generateRoastCacheKey,
  getCachedRoast,
  setCachedRoast,
} from '../services/cache.service.js';

const isJaasSelfRepo = (owner, repo, readmeText) => {
  if (repo && repo.toLowerCase() === 'jaas') return true;
  if (owner && (owner.toLowerCase() === 'rishhbh' || owner.toLowerCase() === 'jaas') && repo && repo.toLowerCase() === 'jaas') return true;
  if (readmeText && (readmeText.includes('Submit a README. Get judged.') || readmeText.includes('Judging-as-a-Service') || readmeText.includes('rishhbh/jaas'))) return true;
  return false;
};

export const fetchReadmePreview = async (req, res, next) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid GitHub repository URL or "owner/repo" string.',
      });
    }

    const { owner, repo } = parseGithubUrl(repoUrl);
    const githubData = await fetchRepoReadme(owner, repo);

    return res.status(200).json({
      success: true,
      data: {
        owner,
        repo,
        metadata: {
          name: githubData.name,
          path: githubData.path,
          html_url: githubData.html_url,
          download_url: githubData.download_url,
          size: githubData.size,
        },
        markdown: githubData.markdown,
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to fetch README from GitHub.',
    });
  }
};

export const judgeReadme = async (req, res, next) => {
  try {
    const validation = judgeReadmeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { repoUrl, readmeText, model } = validation.data;

    let source = 'direct_text';
    let owner = null;
    let repo = null;
    let cacheKey = null;

    if (repoUrl) {
      source = 'github';
      const parsed = parseGithubUrl(repoUrl);
      owner = parsed.owner;
      repo = parsed.repo;
      cacheKey = generateRoastCacheKey({ owner, repo });
    } else {
      cacheKey = generateRoastCacheKey({ readmeMarkdown: readmeText });
    }

    // Check Upstash Redis cache first
    const cachedData = await getCachedRoast(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        cached: true,
        rateLimit: req.rateLimit,
        data: cachedData,
      });
    }

    let readmeMarkdown = '';
    let repoMetadata = null;

    if (source === 'github') {
      const githubData = await fetchRepoReadme(owner, repo);
      readmeMarkdown = githubData.markdown;
      repoMetadata = {
        name: githubData.name,
        path: githubData.path,
        html_url: githubData.html_url,
        download_url: githubData.download_url,
        size: githubData.size,
      };
    } else {
      readmeMarkdown = readmeText;
    }

    if (!readmeMarkdown || !readmeMarkdown.trim()) {
      return res.status(400).json({
        success: false,
        message: 'README content is empty and cannot be judged.',
      });
    }

    let roast = '';
    if (isJaasSelfRepo(owner, repo, readmeMarkdown)) {
      roast = jaasSelfRoastVerdict;
    } else {
      const repoName = repo ? `${owner}/${repo}` : 'Uploaded README';
      roast = await generateRepoRoast(readmeMarkdown, { repoName, model });
    }

    const responsePayload = {
      source,
      owner,
      repo,
      metadata: repoMetadata,
      readmeMarkdown,
      roast,
    };

    // Store response in Redis cache (24h TTL)
    await setCachedRoast(cacheKey, responsePayload);

    return res.status(200).json({
      success: true,
      cached: false,
      rateLimit: req.rateLimit,
      data: responsePayload,
    });
  } catch (err) {
    next(err);
  }
};
