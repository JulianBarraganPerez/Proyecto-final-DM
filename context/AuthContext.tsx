import React, { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface AuthState {
    user?: any;
    isLogged: boolean;
}

const authStateDefault: AuthState = {
    user: undefined,
    isLogged: false,
};

interface AuthContextProps {
    state: AuthState;
    signUp: (firstname: string, lastname: string, email: string, password: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: any) {
    const [state, dispatch] = useReducer(authReducer, authStateDefault);

    useEffect(() => {
        // signUp("John", "Doe", "john.doe@example.com", "password123");
        // signIn("john.doe@example.com", "password123");
        // console.log("HOLA MUNDO")
    }, []);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const docRef = doc(db, "Users", userCredential.user.uid);
            const docSnap = await getDoc(docRef);
            dispatch({ type: "LOGIN", payload: userCredential.user });

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                dispatch({ type: "LOGIN", payload: { user: docSnap.data() } });
            } else {
                console.log("No such document!");
            }

            return true;
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error: ", {
                errorCode,
                errorMessage
            });
            return false;
        }
    };

    const signUp = async (firstname: string, lastname: string, email: string, password: string): Promise<boolean> => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const user = response.user;
            const uid = user.uid;

            // Guardar la información adicional del usuario en Firestore
            await setDoc(doc(db, "Users", uid), {
                firstname,  // Usar los valores proporcionados
                lastname,   // Usar los valores proporcionados
                email,
            });

            dispatch({ type: "LOGIN", payload: response.user });
            return true;
        } catch (error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error: ", {
                errorCode,
                errorMessage
            });
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ state, signIn, signUp }}>
            {children}
        </AuthContext.Provider>
    );
}
