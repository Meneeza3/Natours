import axios from "axios";
import { showAlert } from "./alert";
export const updateSettings = async (data, type) => {
  try {
    const url = type === "data" ? "/api/v1/users/updateMe" : "/api/v1/users/updatePassword";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status == "success") {
      showAlert("success", `Your ${type} updated successfully`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
