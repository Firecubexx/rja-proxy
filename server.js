const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  res.send('RJA Proxy OK')
})

app.post('/proxy', async (req, res) => {
  try {
    const { messages, system, max_tokens } = req.body

    const groqMessages = []
    if (system) groqMessages.push({ role: 'system', content: system })
    messages.forEach(m => groqMessages.push(m))

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 2000,
        messages: groqMessages
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(500).json({ error: { message: data.error.message } })
    }

    const text = data.choices?.[0]?.message?.content || 'No response'
    res.json({ content: [{ type: 'text', text }] })

  } catch (err) {
    res.status(500).json({ error: { message: err.message } })
  }
})

app.listen(process.env.PORT || 3000, () => console.log('Proxy running'))
