import axios from "axios";

export class PostImgService {
    async postImg(img) {
        const response = await axios.post("http://localhost:4000/img/save", img, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return await response.data;
    }
}

    // console.log(img)

    // axios.post("http://localhost:4000/img/save",
    //     img,
    //     {headers: {"content-type": "application/json"}}
    // )
    // .then(response => {console.log(response.data)});
    // .catch(error => {console.log(error)});
// }