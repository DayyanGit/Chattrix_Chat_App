import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { useUserState } from "./userStore";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    showDetail: false,
    toggleDetail: () => set((state) => ({ showDetail: !state.showDetail })),

    changeChat: (chatId, user) => {
        const currentUser = useUserState.getState().currentUser

        // CHECK IF CURRENT USER IS BLOCKED

        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            })
        }else if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user: user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            })
        }else {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            })
        }
 
        

    },

    changeBlock: ()=>{
        set(state =>({...state, isReceiverBlocked: !state.isReceiverBlocked}))
    }
}));