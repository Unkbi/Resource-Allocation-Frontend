
export const isDataEmpty = (data) => {
  return !data || !Array.isArray(data) || data.length === 0;
};


export const hasBarChartAllZeroValues = (data, keys) => {
  if (isDataEmpty(data)) return true;
  
  return data.every(item => {
    return keys.every(key => {
      const value = Number(item[key] || 0);
      return value === 0;
    });
  });
};

export const hasPieChartAllZeroValues = (data) => {
  if (isDataEmpty(data)) return true;
  
  return data.every(item => {
    const value = Number(item.value || 0);
    return value === 0;
  });
};

export const hasLineChartAllZeroValues = (series) => {
  if (isDataEmpty(series)) return true;
  
  return series.every(s => {
    if (!s.data || !Array.isArray(s.data)) return true;
    return s.data.every(value => Number(value || 0) === 0);
  });
};

export const hasStackedChartAllZeroValues = (data, keys) => {
  if (isDataEmpty(data)) return true;
  
  return data.every(item => {
    return keys.every(key => {
      const value = Number(item[key] || 0);
      return value === 0;
    });
  });
};

export const hasAllEmptyArrays = (dataObject) => {
  if (!dataObject || typeof dataObject !== 'object') return true;
  
  const values = Object.values(dataObject);
  if (values.length === 0) return true;
  
  return values.every(val => {
    if (!Array.isArray(val)) return true;
    return val.length === 0;
  });
};
