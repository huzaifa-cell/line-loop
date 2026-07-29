// we will just fetch the API route and print the headers and status
async function test() {
  const url = 'http://localhost:3000/api/admin/screenshots/d781b5cb-f059-46a0-ab8b-6e8cc5057e06/881cca41-8127-4456-87c1-0f4f9bad4445.png';
  
  try {
    const res = await fetch(url, { redirect: 'manual' });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
