import { combineReducers, createStore } from "redux";
import { UserReducer } from "../reducers/UserReducer";
import { AddressReducer } from "../reducers/AddressReducer";
import { CartShoppingReducer } from "../reducers/CartShoppingReducer";
const rootReducer=combineReducers(
    {
        user: UserReducer,
        address: AddressReducer,
        cartshopping: CartShoppingReducer,
    }
);
const Store=createStore(rootReducer);
export {Store};