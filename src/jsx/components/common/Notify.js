// notify.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function notify({
  type = "success",
  message = "success",
  position = "top-center",
}) {
  const toastConfig = {
    position: position,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };
  switch (type) {
    case "success":
      toast.success(message, toastConfig);
      break;
    case "error":
      toast.error(message, toastConfig);
      break;
    case "info":
      toast.info(message, toastConfig);
      break;
    case "warning":
      toast.warning(message, toastConfig);
      break;
    default:
      toast(message, toastConfig);
      break;
  }
  // toast.configure({
  //     position: position,
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
}
