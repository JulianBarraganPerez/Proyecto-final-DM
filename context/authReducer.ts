import { AuthState } from "./AuthContext";

type ActionsProps = 
    | { type: "LOGIN"; payload: any } // Cambia 'any' por el tipo correcto si es posible
    | { type: "LOGOUT" };

export const authReducer = (state: AuthState, action: ActionsProps): AuthState => {
    
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload,
                isLogged: true, 
            };

        case "LOGOUT":
            return {
                ...state,
                user: undefined,
                isLogged: false, 
            };

        default:
            return state;
    }
};
