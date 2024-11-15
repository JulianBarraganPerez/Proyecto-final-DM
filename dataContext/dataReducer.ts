import { DataState } from "./DataContext";

type ActionsProps = { type: "login", payload: any }

export const dataReducer = (state: DataState, actions: ActionsProps): DataState => {
    switch (actions.type) {

        default:
            return state
    }
}