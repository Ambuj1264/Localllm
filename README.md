# Next.js + Docker Model Runner Starter

This project is a **Next.js starter** integrated with **Docker Model Runner (DMR)** to run AI models locally and interact with them via REST API using OpenAI-compatible endpoints.

---

## 🚀 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) or Docker Engine
- Node.js >= 18
- Yarn or npm

---

## 🐳 Docker Model Runner Setup

### 1. Pull the AI model

```bash
docker model pull ai/gemma3-qat


### 2. Run the model

```bash
docker model run ai/gemma3-qat
```

---

## 🌐 Determine the Base URL

Depending on how you run Docker:

| Environment                     | Base URL                                            |
| ------------------------------- | --------------------------------------------------- |
| Docker Desktop / From container | `http://model-runner.docker.internal/`              |
| Docker Desktop / From host      | `http://localhost:12434/` (TCP host access enabled) |

> You can also call endpoints via a Unix socket: `/var/run/docker.sock`.

---

## 📦 DMR REST API Endpoints

* **Create a model**: `POST /models/create`
* **List models**: `GET /models`
* **Get a model**: `GET /models/{namespace}/{name}`
* **Delete a model**: `DELETE /models/{namespace}/{name}`

---

## 📝 OpenAI-Compatible Endpoints

* **List models**: `GET /engines/llama.cpp/v1/models`
* **Retrieve model**: `GET /engines/llama.cpp/v1/models/{namespace}/{name}`
* **Chat completions**: `POST /engines/llama.cpp/v1/chat/completions`
* **Completions**: `POST /engines/llama.cpp/v1/completions`
* **Embeddings**: `POST /engines/llama.cpp/v1/embeddings`

> You can omit `llama.cpp` from the path, e.g., `POST /engines/v1/chat/completions`.

---

## 💻 Example Requests

### From another container

```bash
curl http://model-runner.docker.internal/engines/llama.cpp/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "model": "ai/smollm2",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Please write 500 words about the fall of Rome."}
        ]
      }'
```

### From host via TCP

```bash
curl http://localhost:12434/engines/llama.cpp/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "model": "ai/smollm2",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Please write 500 words about the fall of Rome."}
        ]
      }'
```

### From host via Unix socket

```bash
curl --unix-socket $HOME/.docker/run/docker.sock \
  localhost/exp/vDD4.40/engines/llama.cpp/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
        "model": "ai/smollm2",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Please write 500 words about the fall of Rome."}
        ]
      }'
```

---

## ⚡ Next.js Starter Integration

This starter includes a simple **API route** to proxy requests to DMR:

`pages/api/chat.js`:

```javascript
export default async function handler(req, res) {
  const response = await fetch('http://localhost:12434/engines/llama.cpp/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

Use it from the frontend:

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'ai/gemma3-qat',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a story about a robot.' },
    ],
  }),
});
const data = await response.json();
console.log(data);
```

---

## 🛠️ Run the Project

```bash
yarn install
yarn dev
```

Your Next.js app will run at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Notes

* Make sure your model container is running before making API calls.
* For GPU-backed inference, enable GPU support in Docker Desktop.
* Adjust the base URL depending on whether you’re running inside a container or from the host.

