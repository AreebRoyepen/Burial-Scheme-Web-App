import axios from "axios";
import jwt from "jwt-decode";

let API_BASE_ADDRESS
if(process.env.NODE_ENV == "development"){
    API_BASE_ADDRESS = "http://localhost:8080/"
}
else if (process.env.NODE_ENV == "production"){
  API_BASE_ADDRESS = process.env.REACT_APP_API_BASE_ADDRESS
}

let axiosInstance = axios.create({
  baseURL: API_BASE_ADDRESS,
  timeout: 20000,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && originalRequest.url === "refresh") {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.refreshToken;
      let decode = jwt(localStorage.token)
      const user = decode.user;

      return await axiosInstance
        .post(
          "refresh",
          {
            refreshToken: refreshToken,
            username: user.username,
          },
          { headers: {} }
        )
        .then((resp) => {
          if (resp.status === 200) {

            localStorage.clear();
            localStorage.setItem("token", resp.data.token);
            localStorage.setItem("refreshToken", resp.data.refreshToken);
          
            originalRequest.headers["Authorization"] =  "Bearer " + localStorage.token;
            axiosInstance.defaults.headers.common["Authorization"] =  "Bearer " + localStorage.token;
            return axiosInstance(originalRequest);
          }
        });
    }
    return Promise.reject(error);
  }
);

export const PREMIUM = 1;
export const CLAIM = 2;
export const INCOME = 3;
export const EXPENSE = 4;

export async function login(endpoint, payload) {
  const uri = endpoint;

  return axios
    .post(API_BASE_ADDRESS + uri, payload)
    .then((resp) => {
      //console.log(resp);

      if (resp.status === 200) {
        let decode = jwt(resp.data.token);
        JSON.stringify(decode.user)
        // let now = new Date().getTime();
        // let exp = new Date(decode.exp * 1000).getTime();
        // localStorage.setItem("expiration", exp - now);

        localStorage.setItem("token",resp.data.token);
        localStorage.setItem("refreshToken", resp.data.refreshToken);
        axiosInstance.defaults.headers.common["Authorization"] =  "Bearer " +  localStorage.token;

        return { message: "SUCCESS" };
      }
    })
    .catch((e) => {
      if (e.response) {
        if (e.response.status === 400) {
          return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }

        return { message: "no connection" };
      }
    });
}

// async refresh(endpoint){

//     const uri = API_BASE_ADDRESS + "/" + endpoint;

//     return instance.get(uri, {headers : {"Authorization" : localStorage.getItem("token")}})
//     .then(resp => {

//         if(resp.status === 200){
//             localStorage.setItem("token","Bearer " + resp.data.token)
//             return {"message" : "SUCCESS"}
//         }
//    })
//    .catch(
//     e =>{

//         if(e.response){

//             if(e.response.status === 400){
//                 return {"message" : "error"}
//             }else if(e.response.status === 401){
//                 return {"message" : "unauthorized"}
//             }

//         }else{
//             if (e.code === 'ECONNABORTED'){
//                 return {"message" : "timeout"}
//             }

//             return {"message" : "no connection"}
//         }
//     }
// )
// }

export async function getRequest(endpoint) {
  const uri = endpoint;
  //console.log(uri);
  return axiosInstance
    .get(uri)
    .then((resp) => {
      if (resp.status === 200) {
        //console.log(resp.data);
        return resp.data;
      }
    })
    .catch((e) => {
      //console.log(e);

      if (e.response) {
        if (e.response.status === 400) {
          return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }
        return { message: "no connection" };
      }
    });
}

export async function postRequest(endpoint, payload) {
  const uri = endpoint;

  return axiosInstance
    .post(uri, payload)
    .then((resp) => {
      if (resp.status === 200) {
        //console.log(resp);
        return resp.data;
      }
    })
    .catch((e) => {
      //console.log(e);
      //console.log(e.response);

      if (e.response) {
        if (e.response.status === 400) {
          return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }
        return { message: "no connection" };
      }
    });
}

export async function putRequest(endpoint, payload) {
  const uri = endpoint;

  return axiosInstance
    .put(uri, payload)
    .then((resp) => {
      if (resp.status === 200) {
        return resp.data;
      }
    })
    .catch((e) => {
      //console.log(e);

      if (e.response) {
        if (e.response.status === 400) {
          return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }
        return { message: "no connection" };
      }
    });
}

export async function deleteRequest(endpoint, payload) {
  const uri = endpoint;

  return axiosInstance
    .delete(uri)
    .then((resp) => {
      if (resp.status === 200) {
        return resp.data;
      }
    })
    .catch((e) => {
      //console.log(e);

      if (e.response) {
        if (e.response.status === 400) {
          return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }
        return { message: "no connection" };
      }
    });
}

export async function reportDownloadRequest(endpoint) {
  const uri = endpoint;

  return axiosInstance(uri, {
    method: "GET",
    responseType: "blob",
    timeout: 100000,
  })
    .then((response) => {
      return { message: "SUCCESS", data: response.data };
    })
    .catch((e) => {
      //console.log(e);

      if (e.response) {
        if (e.response.status === 400) {
            return e.response.data;
        } else if (e.response.status === 401) {
          return { message: "unauthorized" };
        }
      } else {
        if (e.code === "ECONNABORTED") {
          return { message: "timeout" };
        }
        return { message: "no connection" };
      }
    });
}

export async function reportDownloadAllRequest(list) {
  list.forEach(function (part, index) {
    this[index] = axiosInstance(part, {
      method: "GET",
      responseType: "blob",
      timeout: 100000,
    });
  }, list);

  return axiosInstance
    .all(list)
    .then(
      axiosInstance.spread((...responses) => {
        //console.log(responses);

        return { message: "SUCCESS", data: responses };

        // use/access the results
      })
    )
    .catch((errors) => {
        
      //console.log(errors);
      return errors;
    });
}

export async function reportEmailAllRequest(list) {
  list.forEach(function (part, index) {
    this[index] = axiosInstance(part, {
      method: "GET",
      timeout: 100000,
    });
  }, list);

  return axiosInstance
    .all(list)
    .then(
      axiosInstance.spread((...responses) => {
        //console.log(responses);

        return { message: "SUCCESS", data: responses };

        // use/access the results
      })
    )
    .catch((errors) => {
      //console.log(errors);
      return errors;
    });
}
