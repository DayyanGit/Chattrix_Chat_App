import React, { useState } from 'react'
import './addUser.css'
import { db } from "../../../../lib/firebase"
import { arrayUnion, collection,doc,getDocs,query,serverTimestamp,setDoc,updateDoc,where } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify'
import { useUserState } from '../../../../lib/userStore'



const AddUser = () => {
    const [user, setUser] = useState(null)

    const {currentUser} = useUserState()

    const handleSearch = async(e)=>{
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try {

            const userRef = collection(db, "users");

            // Create a query against the collection.
            const q = query(userRef, where("username", "==", username));
            const querySnapShot = await getDocs(q)

            if(!querySnapShot.empty){
                setUser(querySnapShot.docs[0].data())
            }else{
                toast.warn("User not found!!")
            }

        } catch (err) {
            // console.log(err)
            
        }
    }


    const handleAdd = async () => {
  const chatRef = collection(db, "chats");
  const userChatsRef = collection(db, "userchats");

  try {
    // 1. Fetch current user's chat list
    const currentUserChatsDoc = await getDocs(query(userChatsRef, where("__name__", "==", currentUser.id)));

    if (!currentUserChatsDoc.empty) {
      const currentUserChatsData = currentUserChatsDoc.docs[0].data();
      const alreadyExists = currentUserChatsData.chats.some(
        (chat) => chat.receiverId === user.id
      );

      if (alreadyExists) {
        toast.info("Chat already exists with this user.");
        return;
      }
    }

    // 2. Create chat and update both userchat docs
    const newChatRef = doc(chatRef);
    await setDoc(newChatRef, {
      createdAt: serverTimestamp(),
      messages: [],
    });

    await updateDoc(doc(userChatsRef, user.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      }),
    });

    await updateDoc(doc(userChatsRef, currentUser.id), {
      chats: arrayUnion({
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAt: Date.now(),
      }),
    });

    toast.success("User added to chat!");
  } catch (err) {
    // console.log(err);
    toast.error("Failed to add user to chat.");
  }
};

return(
    <div className='addUser'>
        <form onSubmit={handleSearch}>
            <input type="text" placeholder='Username' name='username' />
            <button className='search_btn'><img src="./search.png" alt="" /></button>
        </form>
            <ToastContainer position='bottom-right' />
        {user && <div className="user">
            <div className="details">
                <img src={user.avatar || "./avatar.png"} alt="" />
                <span>{user.username}</span>
            </div>
            <button onClick={handleAdd} className='add_btn'>Add User</button>
        </div>
        }
    </div>

  )
}

export default AddUser