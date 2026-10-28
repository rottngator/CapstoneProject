package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type tokenClaims struct {
	UserID int64 `json:"sub"`
	Expiry int64 `json:"exp"`
}

func (a *application) createToken(userID int64) (string, error) {
	header, err := encodeSegment(map[string]string{"alg": "HS256", "typ": "JWT"})
	if err != nil {
		return "", err
	}
	payload, err := encodeSegment(tokenClaims{UserID: userID, Expiry: nowUTC().Add(24 * time.Hour).Unix()})
	if err != nil {
		return "", err
	}
	unsigned := header + "." + payload
	signature := a.sign(unsigned)
	return unsigned + "." + signature, nil
}

func (a *application) parseToken(token string) (int64, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return 0, errors.New("malformed token")
	}
	unsigned := parts[0] + "." + parts[1]
	expected := a.sign(unsigned)
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return 0, errors.New("invalid signature")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return 0, fmt.Errorf("decode claims: %w", err)
	}
	var claims tokenClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return 0, fmt.Errorf("parse claims: %w", err)
	}
	if claims.UserID < 1 || claims.Expiry <= nowUTC().Unix() {
		return 0, errors.New("expired token")
	}
	return claims.UserID, nil
}

func (a *application) sign(value string) string {
	mac := hmac.New(sha256.New, a.jwtSecret)
	_, _ = mac.Write([]byte(value))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func encodeSegment(value any) (string, error) {
	encoded, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(encoded), nil
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func verifyPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func randomFilename(extension string) (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generate file name: %w", err)
	}
	return fmt.Sprintf("%x%s", bytes, extension), nil
}
