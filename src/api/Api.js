import axios from 'axios';
import jwt from 'jwt-decode'

axios.defaults.timeout = 20000;

let API_BASE_ADDRESS = 'http://localhost:8080';
// if(process.env.NODE_ENV == "development"){
//     API_BASE_ADDRESS = ""
// }

export default class Api {

    static PREMIUM = 1;
    static CLAIM = 2;
    static INCOME = 3;
    static EXPENSE = 4;
   
   static async login(endpoint, payload){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    
    return axios.post(uri,payload)
    .then(resp => {
        console.log(resp)

        if(resp.status === 200){
            
            let decode = jwt(resp.data.token)
            let now = new Date().getTime()
            let exp = new Date(decode.exp * 1000).getTime()

            localStorage.setItem("token","Bearer " + resp.data.token)
            localStorage.setItem("user", JSON.stringify(decode.user))
            localStorage.setItem("expiration", (exp - now))
            return {"message" : "SUCCESS"}
        }
   })
   .catch(
    e =>{

        if(e.response){

            if(e.response.status === 400){
                return e.response.data
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }

            return {"message" : "no connection"}
        }    
    }
)
}

static async refresh(endpoint){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    
    return axios.get(uri, {headers : {"Authorization" : localStorage.getItem("token")}})
    .then(resp => {
        
        if(resp.status === 200){
            localStorage.setItem("token","Bearer " + resp.data.token)
            return {"message" : "SUCCESS"}
        }
   })
   .catch(
    e =>{

        if(e.response){

            if(e.response.status === 400){
                return {"message" : "error"}
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }

            return {"message" : "no connection"}
        }    
    }
)
}


   static async getRequest(endpoint){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    console.log(uri)
    return axios.get(uri, {headers : {"Authorization" : localStorage.getItem("token")}})
    .then(resp => {
        if(resp.status === 200){
            console.log(resp.data)
            return resp.data
        }
    })
    .catch(
        e =>{
            console.log(e)

            if(e.response){
    
                if(e.response.status === 400){
                    return e.response.data
                }else if(e.response.status === 401){
                    return {"message" : "unauthorized"}
                }
    
            }else{
                if (e.code === 'ECONNABORTED'){
                    return {"message" : "timeout"}
                }
                return {"message" : "no connection"}
            }
        }
    )
    

   }

   static async postRequest(endpoint, payload){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    
    return axios.post(uri,payload, {headers : {"Authorization" : localStorage.token }})
    .then(resp => {
        if(resp.status === 200){
            console.log(resp)
            return resp.data
        }
   })
   .catch(
    e =>{
        console.log(e)
        console.log(e.response)

        if(e.response){

            if(e.response.status === 400){
                return e.response.data
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }
            return {"message" : "no connection"}
        }
    }
)
}

   static async putRequest(endpoint, payload){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    
    return axios.put(uri,payload, {headers : {"Authorization" : localStorage.getItem("token")}})
    .then(resp => {

        if(resp.status === 200){
            return resp.data
        }
   })
   .catch(
    e =>{
        console.log(e)

        if(e.response){

            if(e.response.status === 400){
                return e.response.data
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }
            return {"message" : "no connection"}
        }
    }
)
       
   }

   static async deleteRequest(endpoint, payload){

    const uri = API_BASE_ADDRESS + "/" + endpoint;
    
    return axios.delete(uri, {headers : {"Authorization" : localStorage.getItem("token")} ,data : payload})
    .then(resp => {

        if(resp.status === 200){
            return resp.data
        }

   })
   .catch(
    e =>{
        console.log(e)

        if(e.response){

            if(e.response.status === 400){
                return e.response.data
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }
            return {"message" : "no connection"}
        }
    }
)

   }

   static async reportDownloadRequest(endpoint){
    
    const uri = API_BASE_ADDRESS + "/" + endpoint;

    return axios(uri, {
        method: 'GET',
        responseType: "blob",
        timeout : 100000,
        headers : {"Authorization" : localStorage.getItem("token")}
    })
    .then(response => {

            return {"message" : "SUCCESS", "data":response.data}


    })
   .catch(
    e =>{
        console.log(e)

        if(e.response){

            if(e.response.status === 400){
                return {"message" : "error"}
            }else if(e.response.status === 401){
                return {"message" : "unauthorized"}
            }

        }else{
            if (e.code === 'ECONNABORTED'){
                return {"message" : "timeout"}
            }
            return {"message" : "no connection"}
        }
    }
)
   }

   static async reportDownloadAllRequest(list){

    list.forEach(function (part, index) {
        
        this[index] = 
        axios(API_BASE_ADDRESS + "/" + part, {
            method: 'GET',
            responseType: "blob",
            timeout : 100000,
            headers : {"Authorization" : localStorage.getItem("token")}
        })

      }, list);

      return axios.all(list).then(axios.spread((...responses) => {
        
        console.log(responses)

        return {"message" : "SUCCESS", "data":responses}

        // use/access the results 
      })).catch(errors => {
        
        console.log(errors)
        
      })
    
    
    
    

   }

}