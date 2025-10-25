import { Types } from "../Types"
const initalState=[

]
const AddressReducer=(state=initalState, action)=>{
    switch(action.type){
        case Types.Address.AddAddress:
            return [
                action.payload, ...state
            ];
        case Types.Address.DeleteAddress:
            return state.filter(item=>item.id!==action.payload);
        case Types.Address.UpdateAddress:
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
        default:
            return state;
    }
}
export {AddressReducer}