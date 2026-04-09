const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.send('RJA Proxy running ✓ — WARNING: No API key set')
  res.send(`RJA Proxy running ✓ — Key loaded (${key.substring(0,10)}...)`)
})

app.post('/proxy', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY

  if (!key) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set in environment' } })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: { message: err.message } })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Proxy ready on port ${PORT}`)
  console.log(`API key set: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO'}`)
})
