// Content script that runs on web pages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_INFO') {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      content: extractContent(),
      type: detectContentType(),
    };
    sendResponse(pageInfo);
  }
});

function extractContent(): string {
  // For articles, try to get the main content
  const article = document.querySelector('article');
  if (article) return article.textContent || '';

  // For YouTube videos
  const youtubePlayer = document.querySelector('#movie_player');
  if (youtubePlayer) {
    return document.title; // We'll get the transcript later using the YouTube API
  }

  // Default to getting the main content area
  const main = document.querySelector('main');
  if (main) return main.textContent || '';

  // Fallback to getting the body content
  return document.body.textContent || '';
}

function detectContentType(): 'article' | 'video' | 'blog' | 'document' {
  const url = window.location.href;
  
  if (url.includes('youtube.com/watch')) {
    return 'video';
  }

  // Check for common blog platforms
  if (
    url.includes('medium.com') ||
    url.includes('wordpress.com') ||
    url.includes('blogger.com')
  ) {
    return 'blog';
  }

  // Check for document extensions
  if (url.match(/\.(pdf|doc|docx|txt)$/i)) {
    return 'document';
  }

  // Default to article
  return 'article';
} 