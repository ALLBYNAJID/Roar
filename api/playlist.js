// api/playlist.js
export default async function handler(req, res) {
  const response = await fetch("http://tv.roarzone.info/app.php?per=true");
  const data = await response.json();

  let m3u = "#EXTM3U\n\n";

  data.forEach((item) => {
    if(item.active === "1") {  // only active channels
      const logo = item.img_url.startsWith('http') ? item.img_url : `http://tv.roarzone.info${item.img_url}`;
      const name = item.ch_name || 'Unknown';
      const tvgId = item.ch_id || '';
      const group = item.group || 'Unknown'; // if no group key, fallback
      const url = item.ch_url + ''; // add token if needed here

      m3u += `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}",${name}\n`;
      m3u += `${url}\n\n`;
    }
  });

  res.setHeader("Content-Type", "application/x-mpegURL");
  res.status(200).send(m3u);
}
