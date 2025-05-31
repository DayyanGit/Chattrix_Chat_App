import React from 'react'
import './userInfo.css'
import { useUserState } from '../../../lib/userStore'
import { auth } from '../../../lib/firebase'
const UserInfo = () => {

    const {currentUser} = useUserState()  
    const handleLogout = ()=>{
      // useUserState.setState({currentUser :null})
      auth.signOut()
    }
  return (
    <div className='UserInfo'>
        <div className="user">
            <img src={currentUser.avatar || "./avatar.png"} alt="" />
            <h2>{currentUser.username}</h2>
        </div>
        <div className="icon">
            <img src="./more.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./logout.png" onClick={handleLogout} alt="" />


        </div>
    </div>
  )
}

export default UserInfo