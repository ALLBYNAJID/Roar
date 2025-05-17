// api/playlist.js
export default async function handler(req, res) {
  const site = "http://tv.roarzone.info";
  try {
    // 1) Fetch homepage HTML
    const homepageResp = await fetch(site);
    if (!homepageResp.ok) throw new Error(`Homepage fetch failed: ${homepageResp.status}`);
    const html = await homepageResp.text();

    // 2) Regex out all <div.item …><a onclick="player.php?stream=ID" …><img src="LOGO" alt="NAME"
    const channelRegex = /onclick="[^"]*stream=([^"]+)"[\s\S]*?src="([^"]+)"[\s\S]*?alt="([^"]+)"/g;
    let match;
    const items = [];
    while ((match = channelRegex.exec(html)) !== null) {
      const [_, streamId, logoPath, name] = match;
      items.push({ streamId, logo: logoPath, name });
    }

    // 3) Build M3U
    let m3u = "#EXTM3U\n\n";
    for (const { streamId, logo, name } of items) {
      // 3a) Resolve logo URL
      const tvgLogo = logo.startsWith("http") ? logo : `${site}/${logo}`;
      // 3b) Fetch real .m3u8 link
      const apiUrl = `${site}/api/stream.php?stream=${streamId}`;
      const streamResp = await fetch(apiUrl);
      if (!streamResp.ok) continue;
      const json = await streamResp.json().catch(() => null);
      const url = json?.stream?.replace(/\\\//g, "/");
      if (!url) continue;

      // 3c) Append to playlist
      m3u += `#EXTINF:-1 tvg-id="${streamId}" tvg-name="${name}" tvg-logo="${tvgLogo}",${name}\n`;
      m3u += `${url}\n\n`;
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    return res.status(200).send(m3u);
  } catch (e) {
    console.error("playlist error:", e);
    return res.status(500).json({ error: "Failed to generate playlist" });
  }
}
