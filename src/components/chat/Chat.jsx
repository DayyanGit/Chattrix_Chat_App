import React, { useState, useEffect, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import './chat.css'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserState } from '../../lib/userStore'
import upload from '../../lib/upload'



const Chat = () => {

  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [chat, setChat] = useState()
  const [img, setImg] = useState({
    file: null,

  })

  const { chatId, user, isReceiverBlocked, isCurrentUserBlocked,toggleDetail } = useChatStore();
  const { currentUser } = useUserState();

  // const isReceiverBlocked = currentUser?.blocked?.includes(user?.id);
  // const isCurrentUserBlocked = user?.blocked?.includes(currentUser?.id);


  const endRef = useRef(null)

  useEffect(() => {

    endRef.current?.scrollIntoView({ behavior: "smooth" })

  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data())
    })

    return () => {
      unSub();
    }
  }, [chatId])

  // console.log(chat)
  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;

    const unsubCurrentUser = onSnapshot(doc(db, "users", currentUser.id), (docSnap) => {
      const currentBlocked = docSnap.data()?.blocked || [];
      const isBlocking = currentBlocked.includes(user.id);
      useChatStore.setState({ isReceiverBlocked: isBlocking });
    });

    const unsubReceiver = onSnapshot(doc(db, "users", user.id), (docSnap) => {
      const receiverBlocked = docSnap.data()?.blocked || [];
      const isBlocked = receiverBlocked.includes(currentUser.id);
      useChatStore.setState({ isCurrentUserBlocked: isBlocked });
    });

    return () => {
      unsubCurrentUser();
      unsubReceiver();
    };
  }, [currentUser?.id, user?.id]);

  // console.log(text)
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji)
    // console.log(e)
  }

  // const toggleEmoji = () => {
  //   setOpen((prev) => !prev);
  //   setTimeout(() => {
  //     endRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 100);
  // };

  const handleSend = async () => {
    if (text === "") return;
    if (isCurrentUserBlocked || isReceiverBlocked) {
      return; // prevent sending if blocked
    }

    try {

      let imgUrl = null;

      if (img.file) {
        imgUrl = await upload(img.file)
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl })
        })
      })

      const userIDs = [currentUser.id, user.id]

      userIDs.forEach(async (id) => {


        const userChatsRef = doc(db, "userchats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId == chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          })
        }
      })


    } catch (err) {
      // console.log(err)

    }

    setImg({
      file: null,
      url: ""
    })
    setText("");
  }

  const handleImg = e => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })

    }
  }

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', handleResize);

  return (
    <div className='chat'>
      <div className="top">
        {window.innerWidth < 768 && (
          <button className="backBtn" onClick={() => useChatStore.setState({ chatId: null, user: null })}>
            <img src="./back-button.png" className='backbtn' alt="" />
          </button>
        )}

        <div className="user">
          <img src={(isCurrentUserBlocked || isReceiverBlocked) ? "./avatar.png" : user?.avatar} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p> Lorem ipsum dolor sit amet. </p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" onClick={toggleDetail} alt="" />

        </div>
      </div>


      <div className="center">

        {chat?.messages?.map((message) => (


          <div className={message.senderId == currentUser.id ? "message own" : "message"} key={message.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* <span>1 min ago</span> */}
            </div>
          </div>

        ))
        }
        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>}
        <div ref={endRef}></div>


      </div>

      {open && <div className="emoji-overlay" onClick={() => setOpen(false)} />}

      {isMobile && open && (
        <div className="emoji-container">
          <EmojiPicker onEmojiClick={handleEmoji} />
        </div>
      )}

      <div className="bottom" disabled={isCurrentUserBlocked || isReceiverBlocked}>
        <div className="icons">
          <label htmlFor='file'>
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{ display: "none" }} onChange={handleImg} />
          {!isMobile && <img src="./camera.png" alt="" />}
          {!isMobile && <img src="./mic.png" alt="" />}

        </div>
        <input
          type="text"
          placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't message this User!" : 'Type a message...'}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isCurrentUserBlocked && !isReceiverBlocked) {
              e.preventDefault(); // Prevent line break
              handleSend();
            }
          }}
        />
        {/* <input type="text" placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You can't message this User!" : 'Type a message...'} disabled={isCurrentUserBlocked || isReceiverBlocked} value={text} onChange={(e) => setText(e.target.value)} /> */}
        <div className="emoji">
          {!isMobile && <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />}
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked} ><img src="./send.png"  alt="" /></button>
      </div>
    </div>
  )
}


export default Chat