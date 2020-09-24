const stripe = Stripe('pk_test_1XT1GDFTst8d9OBSFwk4WQFA00WB2P1zRQ');

const checkout = (sessionId) => {
  stripe.redirectToCheckout({
    sessionId,
  });
};