import React, { useEffect, useState } from "react";
import { UserContext } from "../App";
import Dropzone, {useDropzone} from 'react-dropzone';
import Axios from "axios";



function MyProfile() {
    const { user, setUser } = React.useContext(UserContext)
    const [files, setFiles] = React.useState([])
    const [imageUrl, setImageUrl] = useState('');


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
      formData.append("upload_preset", "cdhcqpsu");
      Axios.post(
        "https://api.cloudinary.com/v1_1/dslclh67l/image/upload",
        formData
      ).then((response) => {
        setImageUrl(response.data.url);
      });
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


    return (

            <div className="ProfilePageMain">
              <div>
              </div>
              <div className="ProfilePageImage" {...getRootProps()} >
                <input onChange={() => uploadImage()} {...getInputProps()}/>
                      <img src={user.image} alt="avatar"/>
                      <div>hi</div>
                    </div>
              </div>
    )

  }

export default MyProfile;