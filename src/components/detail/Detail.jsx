import React from 'react'
import './detail.css'
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserState } from '../../lib/userStore'
import { updateDoc, arrayRemove, arrayUnion, doc } from 'firebase/firestore'

import { useEffect } from 'react'

const Detail = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserState();



  const handleLogout = () => {
    // useUserState.setState({ currentUser: null })
    auth.signOut()
  }

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id)

    try {
      changeBlock()
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })
    } catch (err) {
      // console.log(err)
    }
  }


  return (

    <div className='detail'>
      {window.innerWidth < 768 && (
        <button className="backBtn" onClick={() => useChatStore.setState({ showDetail: false }
        )}>
          <img src="./back-button.png" className='backbtn' alt="" />
        </button>
      )}
      <div className="user">
        <img src={(isCurrentUserBlocked || isReceiverBlocked) ? "./avatar.png" : user?.avatar} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>

        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png" alt="" />
                <span>photo_2025_1.png</span>
              </div>
              <img src="./download.png" className="icon" alt="" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png" alt="" />
                <span>photo_2025_1.png</span>
              </div>
              <img src="./download.png" className="icon" alt="" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png" alt="" />
                <span>photo_2025_1.png</span>
              </div>
              <img src="./download.png" className="icon" alt="" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://cdn.pixabay.com/photo/2018/08/04/11/30/draw-3583548_1280.png" alt="" />
                <span>photo_2025_1.png</span>
              </div>
              <img src="./download.png" className="icon" alt="" />
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button onClick={handleBlock}>{isCurrentUserBlocked ? "You are blocked!" : isReceiverBlocked ? "Unblock User" : "Block User"}</button>
        <button className='logout' onClick={handleLogout} >Logout</button>
      </div>
    </div>
  )
}

export default Detail