const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  res.send('RJA Proxy running OK - Groq')
})

app.post('/proxy', async (req, res) => {
  try {
    const messages = req.body.messages || []
    const system = req.body.system || ''

    const groqMessages = []
    if (system) groqMessages.push({ role: 'system', content: system })
    groqMessages.push(...messages)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: groqMessages
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(500).json({ error: { message: data.error.message } })
    }

    // Convert Groq response to Anthropic format so frontend works unchanged
    res.json({
      content: [{ type: 'text', text: data.choices?.[0]?.message?.content || 'No response' }]
    })

  } catch (err) {
    res.status(500).json({ error: { message: err.message } })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('Proxy running on port ' + PORT))
