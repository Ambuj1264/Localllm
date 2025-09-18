export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "`messages` must be an array" });
    return;
  }

  try {
    const endpoint = "http://localhost:12434/engines/llama.cpp/v1/chat/completions";

    const body = {
      model: "ai/gemma3-qat:270M-F16",
      messages,
      stream: true,
    };

    const fetchRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      res.status(fetchRes.status).json({ error: errText });
      return;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const reader = fetchRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          try {
            const json = JSON.parse(line.replace(/^data:\s*/, ""));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(delta);
              if (res.flush) res.flush();
            }
          } catch {
            // ignore invalid lines
          }
        }
      }
    }

    res.end();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
