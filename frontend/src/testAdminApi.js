import api from "./api/axios";

const testAdminHotels = async () => {
  console.log("Button clicked");

  try {
    const response = await api.get("/hotels/admin/all");

    console.log("Status:", response.status);
    console.log("Complete Response:", response);
    console.log(
      "Response Data:",
      JSON.stringify(response.data, null, 2)
    );
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log(
      "Admin API Error:",
      error.response?.data || error.message
    );
  }
};

export default testAdminHotels;