package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type contextKey string

const userIDContextKey contextKey = "userID"

type apiError struct {
	Message string `json:"message"`
}

func (a *application) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("POST /auth/register", a.register)
	mux.HandleFunc("POST /auth/login", a.login)
	mux.HandleFunc("POST /auth/logout", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"message": "Logout successful"})
	})

	mux.Handle("GET /user/profile", a.requireAuth(http.HandlerFunc(a.getProfile)))
	mux.Handle("PUT /user/profile", a.requireAuth(http.HandlerFunc(a.updateProfile)))
	mux.Handle("GET /user/tracks", a.requireAuth(http.HandlerFunc(a.userTracks)))
	mux.HandleFunc("GET /user/search", a.userSuggestions)
	mux.HandleFunc("GET /search", a.searchUsers)

	mux.Handle("POST /upload", a.requireAuth(http.HandlerFunc(a.uploadTrack)))
	mux.Handle("POST /upload/music", a.requireAuth(http.HandlerFunc(a.uploadTrack)))
	mux.HandleFunc("GET /tracks/recent-tracks", a.recentTracks)
	mux.HandleFunc("GET /tracks/featured", a.featuredTrack)
	mux.Handle("PUT /tracks/feature/{id}", a.requireAuth(http.HandlerFunc(a.featureTrack)))
	mux.Handle("DELETE /files/{id}", a.requireAuth(http.HandlerFunc(a.deleteTrack)))
	mux.HandleFunc("GET /files/{id}", a.serveTrack)

	mux.Handle("POST /events", a.requireAuth(http.HandlerFunc(a.createEvent)))
	mux.HandleFunc("GET /events", a.listEvents)
	mux.HandleFunc("GET /events/{id}", a.getEvent)
	mux.Handle("PUT /events/{id}", a.requireAuth(http.HandlerFunc(a.updateEvent)))
	mux.Handle("DELETE /events/{id}", a.requireAuth(http.HandlerFunc(a.deleteEvent)))
	mux.Handle("GET /chat/messages", a.requireAuth(http.HandlerFunc(a.listChatMessages)))
	mux.Handle("POST /chat/messages", a.requireAuth(http.HandlerFunc(a.createChatMessage)))
	mux.Handle("POST /feedback", a.requireAuth(http.HandlerFunc(a.createFeedback)))

	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(a.uploadDir))))
	return a.cors(a.recoverPanics(mux))
}

func (a *application) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin == a.frontend {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Add("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *application) recoverPanics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				log.Printf("panic handling %s %s: %v", r.Method, r.URL.Path, recovered)
				writeError(w, http.StatusInternalServerError, "Internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (a *application) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		const prefix = "Bearer "
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, prefix) {
			writeError(w, http.StatusUnauthorized, "Authentication required")
			return
		}
		userID, err := a.parseToken(strings.TrimSpace(strings.TrimPrefix(header, prefix)))
		if err != nil {
			writeError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}
		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func authenticatedUserID(r *http.Request) int64 {
	userID, _ := r.Context().Value(userIDContextKey).(int64)
	return userID
}

func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "Invalid ID")
		return 0, false
	}
	return id, true
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write JSON response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, apiError{Message: message})
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(destination); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON request body")
		return false
	}
	return true
}

func nowUTC() time.Time {
	return time.Now().UTC()
}
