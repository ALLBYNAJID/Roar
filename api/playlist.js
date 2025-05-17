export default async function handler(req, res) {
  const site = "http://tv.roarzone.info";
  try {
    // 1) Fetch homepage
    const homepageResp = await fetch(site);
    if (!homepageResp.ok) {
      console.error("Homepage fetch failed:", homepageResp.status);
      throw new Error("Homepage fetch failed");
    }

    const html = await homepageResp.text();

    // 2) Extract channel entries
    const channelRegex = /onclick="[^"]*stream=([^"]+)"[\s\S]*?src="([^"]+)"[\s\S]*?alt="([^"]+)"/g;
    let match;
    const items = [];
    while ((match = channelRegex.exec(html)) !== null) {
      const [_, streamId, logo, name] = match;
      items.push({ streamId, logo, name });
    }

    if (items.length === 0) {
      console.error("No channels found in HTML");
      throw new Error("No channels parsed");
    }

    // 3) Build playlist
    let m3u = "#EXTM3U\n\n";
    for (const { streamId, logo, name } of items) {
      try {
        const tvgLogo = logo.startsWith("http") ? logo : `${site}/${logo}`;
        const apiUrl = `${site}/api/stream.php?stream=${streamId}`;
        const streamResp = await fetch(apiUrl);
        if (!streamResp.ok) {
          console.warn(`Failed stream fetch for ${streamId}: ${streamResp.status}`);
          continue;
        }
        const json = await streamResp.json().catch(() => null);
        const url = json?.stream?.replace(/\\\//g, "/");
        if (!url) {
          console.warn(`No stream found for ${streamId}`);
          continue;
        }

        m3u += `#EXTINF:-1 tvg-id="${streamId}" tvg-name="${name}" tvg-logo="${tvgLogo}",${name}\n`;
        m3u += `${url}\n\n`;
      } catch (innerErr) {
        console.warn("Error processing channel:", streamId, innerErr);
        continue;
      }
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    return res.status(200).send(m3u);
  } catch (e) {
    console.error("Playlist generation error:", e);
    return res.status(500).json({ error: "Failed to generate playlist" });
  }
}
