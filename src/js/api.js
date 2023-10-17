import axios from 'axios';
const apiKey = '40086351-1ecfc0e91427dffbd1011d9dc';
const url = 'https://pixabay.com/api/';
export async function fetchImg(query, page) {
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });
  const resp = await axios.get(`${url}?${params}`);
  return resp.data;
}
