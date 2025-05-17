// api/playlist.js
export default async function handler(req, res) {
  const response = await fetch("http://tv.roarzone.info/app.php?per=true");
  const data = await response.json();

  let m3u = "#EXTM3U\n";

  data.forEach((item) => {
    m3u += `#EXTINF:-1 tvg-id="${item.name}" tvg-name="${item.name}" tvg-logo="${item.logo}" group-title="${item.cat}",${item.name}\n`;
    m3u += `${item.url}\n`;
  });

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.status(200).send(m3u);
}
