exports.buildAttributeQuery = (value, targetProperty) => {
  let query = {};
  const valueRangeSplit = value.split(",");

  if (valueRangeSplit.length === 1) {
    const minValue = valueRangeSplit[0].trim();
    if (minValue && !isNaN(minValue)) {
      query = { [`${targetProperty}`]: { $gte: minValue } };
    }
  } else if (valueRangeSplit.length === 2) {
    const minValue = valueRangeSplit[0].trim();
    const maxValue = valueRangeSplit[1].trim();
    if (minValue && maxValue && !isNaN(minValue) && !isNaN(maxValue)) {
      query = {
        [`${targetProperty}`]: {
          $gte: minValue,
          $lte: maxValue,
        },
      };
    } else if (minValue && !isNaN(minValue)) {
      query = {
        [`${targetProperty}`]: {
          $gte: minValue,
        },
      };
    } else if (maxValue && !isNaN(maxValue)) {
      query = {
        [`${targetProperty}`]: {
          $lte: maxValue,
        },
      };
    }
  }

  return query;
};
