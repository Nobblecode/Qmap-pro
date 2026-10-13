async function verify(data) {
    // Mock logic
    console.log("KYC verification for", data.userId);
    return { status: 'Verified', userId: data.userId };
  }
  
  module.exports = { verify };
  