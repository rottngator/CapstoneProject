package main

import (
	"strings"
	"testing"
	"time"
)

func TestTokenRoundTrip(t *testing.T) {
	app := &application{jwtSecret: []byte(strings.Repeat("x", 32))}
	token, err := app.createToken(42)
	if err != nil {
		t.Fatalf("createToken() error = %v", err)
	}
	userID, err := app.parseToken(token)
	if err != nil {
		t.Fatalf("parseToken() error = %v", err)
	}
	if userID != 42 {
		t.Fatalf("parseToken() userID = %d, want 42", userID)
	}
}

func TestParseTokenRejectsInvalidAndExpiredTokens(t *testing.T) {
	app := &application{jwtSecret: []byte(strings.Repeat("x", 32))}
	if _, err := app.parseToken("not.a.token"); err == nil {
		t.Fatal("parseToken() accepted malformed token")
	}

	header, err := encodeSegment(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		t.Fatal(err)
	}
	expired, err := encodeSegment(tokenClaims{UserID: 2, Expiry: time.Now().Add(-time.Minute).Unix()})
	if err != nil {
		t.Fatal(err)
	}
	unsigned := header + "." + expired
	if _, err := app.parseToken(unsigned + "." + app.sign(unsigned)); err == nil {
		t.Fatal("parseToken() accepted expired token")
	}
}

func TestValidateEvent(t *testing.T) {
	input := eventRequest{
		Title: "Listening party", Location: "Studio 4", Date: "2026-10-28", Time: "19:30",
	}
	if err := validateEvent(input); err != nil {
		t.Fatalf("validateEvent() error = %v", err)
	}

	input.Date = "tomorrow"
	if err := validateEvent(input); err == nil {
		t.Fatal("validateEvent() accepted invalid date")
	}
}
