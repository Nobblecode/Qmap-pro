async function check(data) {
    console.log("Fraud check for", data.transactionId);
    // Mock logic
    const suspicious = Math.random() < 0.1;
    return { transactionId: data.transactionId, flagged: suspicious };
  }
  
  module.exports = { check };
  