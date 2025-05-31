import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

export const useUserState = create((set) => ({
    currentUser: null,
    isLoading: true,
    fetchUserInfo: async (uid) => {
        if (!uid) return set({ currentUser: null, isLoading: false })

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            // console.log("from fui try")

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data(), isLoading: false })
                // console.log("from fui exists")
            } else {
                // console.log("from fui else")
                set({ currentUser: null, isLoading: false })
            }

        } catch (err) {
            // console.log(err);
            return set({ currentUser: null, isLoading: false })

        }
    }
}));