const channels = [
  {
    "0":"bk/102",
    "1":"T Sports",
    "2":"70",
    "3":"/tvassets/images/102.png",
    "4":"1",
    "ch_id":"bk/102",
    "ch_name":"T Sports",
    "serial":"70",
    "img_url":"/tvassets/images/102.png",
    "active":"1",
    "ch_url":"http://peer19.roarzone.info:8080/roarzone/bk/102/index.m3u8?token="
  },
  {
    "0":"bk/25",
    "1":"Star Sports 1",
    "2":"71",
    "3":"/tvassets/images/25.png",
    "4":"1",
    "ch_id":"bk/25",
    "ch_name":"Star Sports 1",
    "serial":"71",
    "img_url":"/tvassets/images/25.png",
    "active":"1",
    "ch_url":"http://peer19.roarzone.info:8080/roarzone/bk/25/index.m3u8?token="
  }
  // add more channels here
];

function generateM3U(channels, token = '') {
  let m3u = '#EXTM3U\n\n';

  channels.forEach(channel => {
    if(channel.active === "1") {
      const tvgId = channel.ch_id || '';
      // Full URL for logo - assuming base URL is tv.roarzone.info
      const logoUrl = channel.img_url.startsWith('http') 
        ? channel.img_url 
        : `http://tv.roarzone.info${channel.img_url}`;
      const name = channel.ch_name || 'Unknown';
      const streamUrl = channel.ch_url + token;

      m3u += `#EXTINF:-1 tvg-id="${tvgId}" tvg-logo="${logoUrl}" tvg-name="${name}",${name}\n`;
      m3u += `${streamUrl}\n\n`;
    }
  });

  return m3u;
}

// Example usage with empty token (replace '' with actual token if needed)
const m3uPlaylist = generateM3U(channels, '');
console.log(m3uPlaylist);
