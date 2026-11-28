/** Internal message format shared by the mobile app and web chat. */
export function readSharedLink(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(/(?:^|\n)(wayfare:\/\/(?:places\/\d+|community\?postId=\d+|itineraries\?id=\d+|profile\?userId=\d+))$/);
  if (!match) return null;
  let path = '/' + match[1].slice('wayfare://'.length);
  path = path.replace(/^\/profile\?userId=(\d+)$/, '/profile/$1');
  return { title: content.slice(0, match.index).trim() || 'Nội dung được chia sẻ', path };
}
