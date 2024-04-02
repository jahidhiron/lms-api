module.exports = (url) => {
  const urlRegex = new RegExp(
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm
  );

  if (!url.match(urlRegex)) {
    return false;
  }

  return true;
};
