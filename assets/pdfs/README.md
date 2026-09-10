# Certificate archive

Place certificate PDF files in this folder, then add one object per credential to `library.json`.

```json
{
  "id": "math-camp-2026",
  "title": "Cambodia Math Camp",
  "description": "Certificate of participation in the advanced mathematics program.",
  "issuer": "Royal University of Phnom Penh",
  "type": "Academic Program",
  "issued": "August 2026",
  "year": 2026,
  "credentialId": "Optional credential number",
  "file": "assets/pdfs/math-camp-2026.pdf",
  "verificationUrl": "https://example.com/verify",
  "featured": true
}
```

The `file` value can also be a complete HTTPS URL when certificates are stored on an external document host. `verificationUrl` is optional.

To link directly to one certificate from a résumé, append its `id` after `#`, for example: `library.html#math-camp-2026`.
