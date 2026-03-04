import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import thunk from "redux-thunk";
import { AuthReducer } from "./reducers/AuthReducer";
import itinerarySlice from "./slices/itinerarySlice";
import roleSlice from "./slices/roleSlice";
import formSlice from "./slices/formSlice";
import fetchSlice from "./slices/fetchSlice";
import userPermissionSlice from "./slices/permissionSlice";
import taxSlice from "./slices/taxSlice";

const middleware = applyMiddleware(thunk);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducers = combineReducers({
  auth: AuthReducer,
  itinerary: itinerarySlice,
  role: roleSlice,
  form: formSlice,
  fetch: fetchSlice,
  userPermission: userPermissionSlice,
  tax: taxSlice,
});

export const store = createStore(reducers, composeEnhancers(middleware));
