export default async function handler(req, res) {
  try {
    const site = "http://tv.roarzone.info";
    const homepage = await fetch(site).then(r => r.text());

    const channelRegex = /onclick="[^"]*stream=([^"]+)".*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"/gs;
    const matches = [...homepage.matchAll(channelRegex)];

    let output = "#EXTM3U\n";

    for (const match of matches) {
      const streamId = match[1];
      const logo = match[2].startsWith("http") ? match[2] : site + "/" + match[2];
      const name = match[3];

      const apiUrl = `${site}/api/stream.php?stream=${streamId}`;
      const json = await fetch(apiUrl).then(r => r.json()).catch(() => null);

      const stream = json?.stream?.replace(/\\\//g, "/");
      if (stream) {
        output += `#EXTINF:-1 tvg-logo="${logo}",${name}\n${stream}\n`;
      }
    }

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.status(200).send(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate playlist" });
  }
}
