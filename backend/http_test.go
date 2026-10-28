package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthAndProtectedRoutes(t *testing.T) {
	app := &application{
		frontend:  "http://localhost:3001",
		jwtSecret: []byte(strings.Repeat("x", 32)),
	}
	handler := app.routes()

	health := httptest.NewRecorder()
	handler.ServeHTTP(health, httptest.NewRequest(http.MethodGet, "/health", nil))
	if health.Code != http.StatusOK || !strings.Contains(health.Body.String(), `"status":"ok"`) {
		t.Fatalf("GET /health = %d %q, want healthy JSON response", health.Code, health.Body.String())
	}

	protected := httptest.NewRecorder()
	handler.ServeHTTP(protected, httptest.NewRequest(http.MethodGet, "/user/profile", nil))
	if protected.Code != http.StatusUnauthorized {
		t.Fatalf("GET /user/profile without token = %d, want %d", protected.Code, http.StatusUnauthorized)
	}
}

func TestCORSPreflight(t *testing.T) {
	app := &application{frontend: "http://localhost:3001"}
	request := httptest.NewRequest(http.MethodOptions, "/auth/login", nil)
	request.Header.Set("Origin", app.frontend)
	response := httptest.NewRecorder()

	app.routes().ServeHTTP(response, request)
	if response.Code != http.StatusNoContent {
		t.Fatalf("OPTIONS status = %d, want %d", response.Code, http.StatusNoContent)
	}
	if got := response.Header().Get("Access-Control-Allow-Origin"); got != app.frontend {
		t.Fatalf("Access-Control-Allow-Origin = %q, want %q", got, app.frontend)
	}
}
