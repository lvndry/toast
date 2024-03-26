import { useState } from "react"

const PUBLIC_API_URL = process.env.PUBLIC_API_URL || "http://localhost:3000"

function IndexPopup() {
  const [data, setData] = useState("")

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    const url = new URL(tabs[0].url)
    const response = await fetch(`${PUBLIC_API_URL}/get-tos-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        website: url.host
      })
    })
    const tosURL = await response.json()
    console.log({ tosURL })
  })

  return (
    <div
      style={{
        padding: 16
      }}>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>
    </div>
  )
}

export default IndexPopup
