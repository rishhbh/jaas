export const parseGithubUrl = (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid GitHub repository URL provided');
  }

  const cleanUrl = url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^github\.com\//i, '')
    .replace(/\/+$/, '');

  const parts = cleanUrl.split('/').filter(Boolean);

  if (parts.length < 2) {
    throw new Error('Invalid GitHub repository URL format. Expected "owner/repo" or "github.com/owner/repo"');
  }

  const [owner, repo] = parts;
  return { owner, repo: repo.replace(/\.git$/i, '') };
};

export const fetchRepoReadme = async (owner, repo) => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'JaaS-App',
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" or its README.md was not found on GitHub.`);
    }
    throw new Error(`Failed to fetch README from GitHub API (Status: ${response.status})`);
  }

  const data = await response.json();

  if (!data.content || typeof data.content !== 'string') {
    throw new Error('README file found on GitHub but content is empty.');
  }

  const markdown = Buffer.from(data.content, 'base64').toString('utf-8');

  return {
    name: data.name,
    path: data.path,
    sha: data.sha,
    size: data.size,
    html_url: data.html_url,
    download_url: data.download_url,
    markdown,
  };
};
