package main

import (
  "encoding/json"
  "log"
  "net/http"
)

type healthResponse struct {
  Status  string `json:"status"`
  Version string `json:"version"`
}

func main() {
  mux := http.NewServeMux()

  mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    _ = json.NewEncoder(w).Encode(healthResponse{Status: "ok", Version: "0.1.0"})
  })

  mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/plain; charset=utf-8")
    _, _ = w.Write([]byte("FreeRoulette backend is running"))
  })

  log.Println("Backend server running on http://localhost:8080")
  log.Fatal(http.ListenAndServe(":8080", mux))
}
