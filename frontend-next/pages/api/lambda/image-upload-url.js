export default async function handler(req, res) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/lambda/image-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_key': req.headers.access_key,
        'secret_key': req.headers.secret_key
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}