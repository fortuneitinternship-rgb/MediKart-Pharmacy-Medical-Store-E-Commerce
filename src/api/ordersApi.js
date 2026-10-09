import axios from "axios";

const API_URL =
    process.env.REACT_APP_API_URL ||
    "http://127.0.0.1:8000";


// =====================================================
// CREATE ORDER
// =====================================================

export const createOrder = async (orderData) => {

    try {

        const response = await axios.post(
            `${API_URL}/api/orders/`,
            orderData
        );

        return response.data;

    } catch (error) {

        console.error(
            "Create order error:",
            error
        );

        const detail =
            error.response?.data?.detail;

        if (Array.isArray(detail)) {

            throw new Error(
                detail
                    .map(
                        (item) =>
                            item.msg
                    )
                    .join(", ")
            );
        }

        throw new Error(
            detail ||
            "Unable to place order."
        );
    }
};


// =====================================================
// GET ALL ORDERS
// =====================================================

export const getOrders = async () => {

    try {

        const response = await axios.get(
            `${API_URL}/api/orders/`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Get orders error:",
            error
        );

        throw new Error(
            error.response?.data?.detail ||
            "Unable to load orders."
        );
    }
};


// =====================================================
// GET SINGLE ORDER
// =====================================================

export const getOrderById = async (
    orderId
) => {

    try {

        const response = await axios.get(
            `${API_URL}/api/orders/${orderId}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Get order error:",
            error
        );

        throw new Error(
            error.response?.data?.detail ||
            "Unable to load order."
        );
    }
};