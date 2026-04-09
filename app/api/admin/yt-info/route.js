import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    let subCountText = null;
    let titleText = null;

    if (apiKey && apiKey !== 'your_api_key_here') {
      let apiUrl = null;
      
      if (url.includes('@')) {
        const handle = url.split('@')[1].split(/[/?]/)[0];
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${handle}&key=${apiKey}`;
      } else if (url.includes('/channel/')) {
        const id = url.split('/channel/')[1].split(/[/?]/)[0];
        apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${id}&key=${apiKey}`;
      }

      if (apiUrl) {
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();
        if (data.items && data.items.length > 0) {
          const stats = data.items[0].statistics;
          const snippet = data.items[0].snippet;
          titleText = snippet.title;
          
          let count = parseInt(stats.subscriberCount) || 0;
          if (count >= 1000000) subCountText = (count / 1000000).toFixed(1) + 'M subscribers';
          else if (count >= 1000) subCountText = (count / 1000).toFixed(1) + 'K subscribers';
          else subCountText = count + ' subscribers';
          
          return NextResponse.json({ success: true, subCountText, title: titleText, source: 'api' });
        }
      }
    }

    // Fallback to scraping if API fails or no API key
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
      }
    });
    const html = await res.text();
    
    // Extract subscriber count
    const match1 = html.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"(.*?)"/);
    const match2 = html.match(/"subscriberCountText":\{"simpleText":"(.*?)"\}/);
    
    if (match1) subCountText = match1[1];
    else if (match2) subCountText = match2[1];

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) titleText = titleMatch[1].replace(' - YouTube', '').replace('YouTube', '').trim();

    return NextResponse.json({ 
       success: true, 
       subCountText: subCountText || 'Not found',
       title: titleText || '',
       source: 'scrape'
    });
  } catch (error) {
    console.error('Error fetching yt info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
