// PrivateRoute.js
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ permission, children }) => {
  const { userPermission } = useSelector((state) => state);
  const isAllowed = userPermission.some((p) =>
    (p?.slug || "").includes(`${permission}-read-`)
  );
  // console.log(isAllowed,'permission',userPermission)

  if (!isAllowed) {
    // Redirect if the user doesn't have the required permission
    // navigate('/page-error-403'); // Redirect to the another route
    // return <Navigate to="/page-error-403" replace />
    return null;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
