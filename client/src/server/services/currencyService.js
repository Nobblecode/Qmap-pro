async function convert(data) {
    const { amount, from, to } = data;
    const rate = 1.1; // Mocked conversion rate
    const convertedAmount = amount * rate;
    return { from, to, original: amount, converted: convertedAmount };
  }
  
  module.exports = { convert };
  