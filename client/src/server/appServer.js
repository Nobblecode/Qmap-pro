async function handleAffiliate(data) {
    console.log("Affiliate Management Logic", data);
    // Simulate business logic and return a mock response
    return { status: 'Affiliate processed', data };
  }
  
  async function handleProduct(data) {
    console.log("Product Listing Logic", data);
    return { status: 'Product processed', data };
  }
  
  module.exports = { handleAffiliate, handleProduct };
  