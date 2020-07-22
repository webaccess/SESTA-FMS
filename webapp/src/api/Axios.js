import axios from "axios";
import Auth from "../components/Auth/Auth.js";

export const serviceProviderForGetRequest = async (
  url,
  payload = {},
  headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${Auth.getToken()}`,
  }
) => {
  const URL = url;
  return await axios(URL, {
    method: "GET",
    headers: headers,
    params: payload,
  })
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

export const serviceProviderForPutRequest = async (
  url,
  id,
  body,
  headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${Auth.getToken()}`,
  }
) => {
  const URL = url;
  return await axios(URL + "/" + id, {
    method: "PUT",
    headers: headers,
    data: body,
  })
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

export const serviceProviderForDeleteRequest = async (
  url,
  id,
  headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${Auth.getToken()}`,
  }
) => {
  const URL = url;
  return await axios(URL + "/" + id, {
    method: "Delete",
    headers: headers,
  })
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

export const serviceProviderForPostRequest = async (
  url,
  payload = {},
  headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${Auth.getToken()}`,
  }
) => {
  const URL = url;
  return await axios(URL, {
    method: "POST",
    headers: headers,
    data: payload,
  })
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};
