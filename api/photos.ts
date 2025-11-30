import type { VercelRequest, VercelResponse } from '@vercel/node';

// This API endpoint is deprecated as the photo list is now fetched 
// directly from the Notion 'photosFile' property via /api/profile.
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json([]);
}