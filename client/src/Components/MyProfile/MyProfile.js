import React, { useEffect, useState } from "react";
import { UserContext } from "../App";
import Dropzone, {useDropzone} from 'react-dropzone';
import Axios from "axios";



function MyProfile() {
    const { user, setUser } = React.useContext(UserContext)
    const [files, setFiles] = React.useState([])
    const [imageUrl, setImageUrl] = useState('')
    const [editUsername, setEditUsername] = useState(false)
    const [editEmail, setEditEmail] = useState(false)
    const [editPassword, setEditPassword] = useState(false)
    const [deleteProfile, setDeleteProfile] = useState(false)
    const [username, setUsername] = useState(user.username)
    const [email, setEmail] = useState(user.email)
    const [password, setPassword] = useState(user.password)
    const [confirmPassword, setConfirmPassword] = useState(user.password)
    const [confirmDelete, setConfirmDelete] = useState('')


    const {getRootProps, getInputProps} = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }
});
    useEffect(() => {
        if (files.length > 0) {
        setUser((prevUser) => ({ ...prevUser, image: files[0].preview }))
        uploadImage()
        }
    }, [files])
  
    function uploadImage() {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("upload_preset", "DeepReads");
      Axios.post(
        "https://api.cloudinary.com/v1_1/deepreadscloud/image/upload",
        formData
      ).then((response) => {
        setImageUrl(response.data.url)
      })
    }

    useEffect(() => {
        if (imageUrl) {
            fetch(`/users/${user.id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: imageUrl }),
            })
        }
    }, [imageUrl])

    function handleSubmit(event) {
        event.preventDefault()
        fetch(`/users/${user.id}`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              username: username,
              email: email
            }),
            })
            .then(response => response.json())
            .then(data => {
                setUser(data)
                setEditUsername(false)
            })
    }

    function handlePasswordSubmit(event) {
      event.preventDefault()
      if (password === confirmPassword) {
        fetch(`/users/${user.id}`,{
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: password
          }),
          })
          .then(response => response.json())
          .then(data => {
              setUser(data)
              setEditPassword(false)
          })
      } else {
        alert("Passwords do not match")
      }
    }

    function handleDeleteProfile() {
      if (confirmDelete === "YES") {
        fetch(`/users/${user.id}`,{
          method: "DELETE",
          })
          fetch("/logout", { method: "DELETE" }).then((r) => {
            if (r.ok) {
              setUser(null)
            }
          })
          alert("Profile Deleted")
        } else {
          alert("Confirmation invalid")
     }
    }


    return (

            <div className="ProfilePageMain">

              <div className="ProfilePageImage" {...getRootProps()} >
                <input onChange={() => uploadImage()} {...getInputProps()}/>
                      <img src={user.image} alt="avatar"/>
                      <div>Click image to select a file or drag and drop.</div>
                    </div>
                    <div className="ProfilePageInfo">
                      <div onClick={() => setEditUsername(!editUsername)}>Username: {user.username}</div>
                      <div onClick={() => setEditEmail(!editEmail)}>Email: {user.email}</div>
                      <div onClick={() => setEditPassword(!editPassword)} className="ProfilePageInfoBtn">Change Password</div>
                      <div onClick={() => setDeleteProfile(!deleteProfile)} className="ProfilePageInfoBtn">Delete Profile</div>
                    </div>


                    <div className={editUsername ? "PopUpWindow" : "hidden"}>
                      <div className="PopUpWindowClose" onClick={() => setEditUsername(!editUsername)}>X</div>
                    <form onSubmit={handleSubmit}>
                      <h2>Change Username</h2>
                      <label>
                        <input type="text" placeholder={username} value={username} onChange={(event) => setUsername(event.target.value) } />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                    </div>

                    <div className={editEmail ? "PopUpWindow" : "hidden"}>
                      <div className="PopUpWindowClose" onClick={() => setEditEmail(!editEmail)}>X</div>
                    <form onSubmit={handleSubmit}>
                      <h2>Change Email</h2>
                      <label>
                        <input type="text" placeholder={email} value={email} onChange={(event) => setEmail(event.target.value) } />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                    </div>

                    <div className={editPassword ? "PopUpWindow" : "hidden"}>
                      <div className="PopUpWindowClose" onClick={() => setEditPassword(!editPassword)}>X</div>
                    <form onSubmit={handlePasswordSubmit}>
                      <h2>Change Password</h2>
                      <label> 
                        <input type="password" placeholder="Enter New Password" value={password} onChange={(event) => setPassword(event.target.value) } />
                      </label>
                      <label>
                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value) } />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                  </div>

                  <div className={deleteProfile ? "PopUpWindow" : "hidden"}>
                    <div className="PopUpWindowClose" onClick={() => setDeleteProfile(!deleteProfile)}>X</div>
                    <form onSubmit={handleDeleteProfile}>
                      <h2>Are you sure you want to delete your profile?</h2>
                      <h3>All your data will be permanently lost.</h3>
                      <h3>This action cannot be undone.</h3>
                      <label>
                        <input type="text" placeholder="Type YES to confirm" value={confirmDelete} onChange={(event) => setConfirmDelete(event.target.value) } />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                  </div>


              </div>
    )

  }

export default MyProfile;