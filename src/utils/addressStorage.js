// LocalStorage Key
const ADDRESS_KEY = "deliveryAddress";

/* -----------------------------
   Save Address
----------------------------- */
export const saveAddress = (address) => {
  localStorage.setItem(
    ADDRESS_KEY,
    JSON.stringify(address)
  );

  // Notify other components
  window.dispatchEvent(
    new Event("addressUpdated")
  );
};

/* -----------------------------
   Get Address
----------------------------- */
export const getAddress = () => {
  const data = localStorage.getItem(
    ADDRESS_KEY
  );

  if (!data) return null;

  return JSON.parse(data);
};

/* -----------------------------
   Remove Address
----------------------------- */
export const removeAddress = () => {
  localStorage.removeItem(
    ADDRESS_KEY
  );

  window.dispatchEvent(
    new Event("addressUpdated")
  );
};

/* -----------------------------
   Default Address
----------------------------- */
export const getDefaultAddress = () => ({
  name: "Satender Kashyap",
  mobile: "+91 98765 43210",
  address: "Select your delivery location",
  city: "",
  state: "",
  pincode: "",
  lat: null,
  lng: null,
});