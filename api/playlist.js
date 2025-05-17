export default async function handler(req, res) {
  try {
    const response = await fetch("https://tv.roarzone.info/app.php?per=true", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
        "Referer": "https://tv.roarzone.info/",
        "Origin": "https://tv.roarzone.info"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status}`);
    }

    const data = await response.json();

    let m3u = "#EXTM3U\n\n";

    data.forEach((item) => {
      if (item.active === "1") {
        const logo = item.img_url && item.img_url.startsWith('http')
          ? item.img_url
          : `https://tv.roarzone.info${item.img_url || ''}`;
        const name = item.ch_name || 'Unknown';
        const tvgId = item.ch_id || '';
        const url = item.ch_url || '';

        m3u += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${name}" tvg-logo="${logo}",${name}\n`;
        m3u += `${url}\n\n`;
      }
    });

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.status(200).send(m3u);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: error.message || "Fetch failed" });
  }
}
