import {
  createRazorpayOrder,
  getPaymentConfig,
  processCheckoutPayment,
  verifyRazorpayPayment,
} from "../api/checkoutApi";

// name@bank  e.g. rahul.k@okhdfcbank, 9876543210@paytm
export const UPI_ID_PATTERN = /^[A-Za-z0-9._-]{2,64}@[A-Za-z][A-Za-z0-9]{1,31}$/;

export const isValidUpiId = (value) =>
  UPI_ID_PATTERN.test(String(value || "").trim());

export const PAYMENT_OPTIONS = [
  ["COD", "Cash on delivery"],
  ["UPI", "UPI (GPay, PhonePe, Paytm, BHIM)"],
  ["CARD", "Credit / Debit card"],
  ["NETBANKING", "Net banking"],
];

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in a browser."));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error("Razorpay failed to load."));
    script.onerror = () =>
      reject(new Error("Unable to load the payment window. Check your internet connection."));
    document.body.appendChild(script);
  });
}

async function payWithRazorpay(orderId) {
  const Razorpay = await loadRazorpayScript();
  const data = await createRazorpayOrder(orderId);

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpay_order_id,
      name: "MediKart",
      description: `Order ${data.order_id}`,
      prefill: {
        name: data.customer?.name,
        email: data.customer?.email,
        contact: data.customer?.contact,
      },
      theme: { color: "#0d9488" },
      handler: async (response) => {
        try {
          resolve(await verifyRazorpayPayment(response));
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment window closed before paying.")),
      },
    });
    checkout.on("payment.failed", (response) =>
      reject(new Error(response?.error?.description || "Payment failed."))
    );
    checkout.open();
  });
}

/** Is the server using real Razorpay (true) or the built-in simulator (false)? */
export async function isRazorpayMode() {
  try {
    const config = await getPaymentConfig();
    return config?.mode === "razorpay" && Boolean(config?.razorpay_enabled);
  } catch {
    return false;
  }
}

/**
 * Pay for an order that already exists.
 * Resolves with the payment receipt ({status, transaction_id, ...}); throws on failure.
 */
export async function payForOrder({ orderId, method, upiId }) {
  if (method === "COD") {
    return processCheckoutPayment({ order_id: String(orderId), method: "COD" });
  }

  if (await isRazorpayMode()) {
    return payWithRazorpay(orderId);
  }

  return processCheckoutPayment({
    order_id: String(orderId),
    method,
    ...(method === "UPI" ? { upi_id: String(upiId || "").trim() } : {}),
  });
}
