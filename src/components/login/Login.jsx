import React, { useState } from 'react'
import './login.css'
import 'react-toastify/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db} from '../..//lib/firebase'
import { collection ,doc,getDocs,query, setDoc, where } from 'firebase/firestore'
import upload from '../../lib/upload'

const Login = () => {

    const [loading, setLoading] = useState(false)
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })


    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target);


        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password)
            // console.log("i am from login")
            
        } catch (err) {
            // console.log(err)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }
    
    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);
        
        //VALIDATE INPUTS
        if (!username || !email || !password){
            setLoading(false)
            return toast.warn("Please enter inputs!");
        }
        if (!avatar.file){ 
            setLoading(false)
            return toast.warn("Please upload an avatar!");}
    
        // VALIDATE UNIQUE USERNAME
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setLoading(false)
            return toast.warn("Select another username");

        }



        
        try {
            
            const res = await createUserWithEmailAndPassword(auth, email, password)

            const imgUrl = await upload(avatar.file)

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            e.target.reset()
            toast.success("Account Created! You can login now!!")
            
        } catch (err) {
            // console.error("Firebase error:", err.code, err.message);
            
            // console.log(err)
            toast.error(err.message)
        } finally {
            setLoading(false)
            // console.log(loading)
        }

    }


    return (
        <div className='login'>

            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <ToastContainer position='bottom-right' />
                    <input type="text" placeholder='Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading} className='btn'>{loading ? "Loading" : "Sign In"}</button>

                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor='file'>
                        <img src={avatar.url || "./avatar.png"} alt="" />Upload Profile Photo</label>
                    <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name='username' />
                    <input type="text" placeholder='Email' name='email' />
                    <input type="password" placeholder='Password' name='password' />
                    <button disabled={loading} className='btn'>{loading ? "Loading" : "Sign Up"}</button>

                </form>
            </div>
        </div>
    )
}

export default Login