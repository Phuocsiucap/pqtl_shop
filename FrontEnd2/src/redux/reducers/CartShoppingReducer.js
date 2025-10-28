import { Types } from "../Types";

const initalState={
    cart:[]
};

const CartShoppingReducer=(state=initalState, action)=>{
    switch(action.type){
        case Types.ShoppingCart.GetCart:
            return { ...state, cart: [...cart,action.payload] };
        case Types.ShoppingCart.AddProduct:
            return [
                ...state, action.payload
            ]
        case Types.ShoppingCart.DeleteProduct:
            return state.filter(item=>item.id!==action.payload)
        case Types.ShoppingCart.UpdateProduct:
            const newlist=state.map(item=>{
                if(item.id===action.payload.id){
                    return {
                        ...item,
                        name: action.payload.name,
                        phone: action.payload.phone,
                        address: action.payload.address
                    };
                }
                return item;
            })
            return newlist;
        default: return state
    }
}
export {CartShoppingReducer}