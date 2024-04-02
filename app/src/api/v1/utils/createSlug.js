const slug = require("slug");

exports.createSlug = (items) => {
  let slugItem = [];
  if (items && items.length && items.length === 0) {
    return "";
  }

  for (let item of items) {
    let tempItem = item.toLowerCase().replace("/", "-").split(" ").join("-");
    slugItem.push(tempItem);
  }

  const tempSlug = slugItem.join("-");

  const options = {
    replacement: "-",
    remove: /[*+~.()',"!:@]/g,
    lower: true,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap,
    trim: true,
    fallback: true,
  };

  const slugify = slug(tempSlug, [{ options }]);
  return slugify;
};
