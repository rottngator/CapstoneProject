package main

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"net/mail"
	"strings"
	"unicode/utf8"
)

type user struct {
	ID             int64  `json:"id"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	ProfilePicture string `json:"profilePicture"`
	Banner         string `json:"banner"`
	About          string `json:"about"`
	Pronouns       string `json:"pronouns"`
	Location       string `json:"location"`
	Label          string `json:"label"`
	Name           string `json:"name"`
}

type registerRequest struct {
	Username             string `json:"username"`
	Email                string `json:"email"`
	Password             string `json:"password"`
	PasswordConfirmation string `json:"passwordConfirmation"`
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

const userColumns = `id, username, email, profile_picture, banner, about, pronouns, location, label, name`

func (a *application) register(w http.ResponseWriter, r *http.Request) {
	var input registerRequest
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	parsedEmail, emailErr := mail.ParseAddress(input.Email)
	if input.Username == "" || input.Email == "" || emailErr != nil || parsedEmail.Address != input.Email || len(input.Password) < 8 {
		writeError(w, http.StatusBadRequest, "Username and email are required; password must be at least 8 characters")
		return
	}
	if len(input.Username) > 40 || len(input.Email) > 254 || !utf8.ValidString(input.Username) {
		writeError(w, http.StatusBadRequest, "Username or email is too long")
		return
	}
	if input.Password != input.PasswordConfirmation {
		writeError(w, http.StatusBadRequest, "Passwords do not match")
		return
	}
	passwordHash, err := hashPassword(input.Password)
	if err != nil {
		logDatabaseError("hash password", err)
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	var createdID int64
	err = a.db.QueryRowContext(r.Context(),
		`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
		input.Username, input.Email, passwordHash,
	).Scan(&createdID)
	if err != nil {
		if isUniqueViolation(err) {
			writeError(w, http.StatusConflict, "Username or email already exists")
			return
		}
		logDatabaseError("create user", err)
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	token, err := a.createToken(createdID)
	if err != nil {
		logDatabaseError("create auth token", err)
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	created, err := a.getUser(r.Context(), createdID)
	if err != nil {
		logDatabaseError("load created user", err)
		writeError(w, http.StatusInternalServerError, "Could not create account")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"token": token, "user": created})
}

func (a *application) login(w http.ResponseWriter, r *http.Request) {
	var input loginRequest
	if !decodeJSON(w, r, &input) {
		return
	}
	var id int64
	var passwordHash string
	err := a.db.QueryRowContext(r.Context(),
		`SELECT id, password_hash FROM users WHERE lower(username) = lower($1)`,
		strings.TrimSpace(input.Username),
	).Scan(&id, &passwordHash)
	if err != nil || !verifyPassword(passwordHash, input.Password) {
		writeError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}
	token, err := a.createToken(id)
	if err != nil {
		logDatabaseError("create auth token", err)
		writeError(w, http.StatusInternalServerError, "Could not sign in")
		return
	}
	account, err := a.getUser(r.Context(), id)
	if err != nil {
		logDatabaseError("load logged-in user", err)
		writeError(w, http.StatusInternalServerError, "Could not sign in")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": account})
}

func (a *application) getUser(ctx context.Context, id int64) (user, error) {
	var result user
	err := a.db.QueryRowContext(ctx, `SELECT `+userColumns+` FROM users WHERE id = $1`, id).Scan(
		&result.ID, &result.Username, &result.Email, &result.ProfilePicture, &result.Banner,
		&result.About, &result.Pronouns, &result.Location, &result.Label, &result.Name,
	)
	return result, err
}

func (a *application) getProfile(w http.ResponseWriter, r *http.Request) {
	account, err := a.getUser(r.Context(), authenticatedUserID(r))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "User not found")
			return
		}
		logDatabaseError("load profile", err)
		writeError(w, http.StatusInternalServerError, "Could not load profile")
		return
	}
	writeJSON(w, http.StatusOK, account)
}

func (a *application) updateProfile(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, a.maxUpload*2)
	if err := r.ParseMultipartForm(2 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid profile update")
		return
	}
	id := authenticatedUserID(r)
	current, err := a.getUser(r.Context(), id)
	if err != nil {
		logDatabaseError("load profile before update", err)
		writeError(w, http.StatusNotFound, "User not found")
		return
	}
	username := formValue(r, "username", current.Username)
	email := strings.ToLower(formValue(r, "email", current.Email))
	if strings.TrimSpace(username) == "" || strings.TrimSpace(email) == "" {
		writeError(w, http.StatusBadRequest, "Username and email are required")
		return
	}
	picture, err := a.saveOptionalImage(r, "profilePicture")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	banner, err := a.saveOptionalImage(r, "banner")
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	profilePicture := current.ProfilePicture
	if picture != "" {
		profilePicture = "/uploads/" + picture
	}
	profileBanner := current.Banner
	if banner != "" {
		profileBanner = "/uploads/" + banner
	}
	_, err = a.db.ExecContext(r.Context(), `
		UPDATE users SET username=$1, email=$2, about=$3, pronouns=$4, location=$5,
		label=$6, name=$7, profile_picture=$8, banner=$9 WHERE id=$10`,
		strings.TrimSpace(username), email, formValue(r, "about", current.About),
		formValue(r, "pronouns", current.Pronouns), formValue(r, "location", current.Location),
		formValue(r, "label", current.Label), formValue(r, "name", current.Name),
		profilePicture, profileBanner, id,
	)
	if err != nil {
		if isUniqueViolation(err) {
			writeError(w, http.StatusConflict, "Username or email already exists")
			return
		}
		logDatabaseError("update profile", err)
		writeError(w, http.StatusInternalServerError, "Could not update profile")
		return
	}
	updated, err := a.getUser(r.Context(), id)
	if err != nil {
		logDatabaseError("load updated profile", err)
		writeError(w, http.StatusInternalServerError, "Could not load updated profile")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "Profile updated successfully", "user": updated})
}

func (a *application) userSuggestions(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("query"))
	if query == "" {
		writeJSON(w, http.StatusOK, []string{})
		return
	}
	rows, err := a.db.QueryContext(r.Context(),
		`SELECT username FROM users WHERE username ILIKE $1 ORDER BY username LIMIT 8`,
		"%"+escapeLike(query)+"%",
	)
	if err != nil {
		logDatabaseError("search user suggestions", err)
		writeError(w, http.StatusInternalServerError, "Could not search users")
		return
	}
	defer rows.Close()
	names := make([]string, 0)
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			logDatabaseError("read user suggestion", err)
			writeError(w, http.StatusInternalServerError, "Could not search users")
			return
		}
		names = append(names, name)
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate user suggestions", err)
		writeError(w, http.StatusInternalServerError, "Could not search users")
		return
	}
	writeJSON(w, http.StatusOK, names)
}

func (a *application) searchUsers(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("query"))
	if query == "" {
		writeJSON(w, http.StatusOK, []user{})
		return
	}
	rows, err := a.db.QueryContext(r.Context(),
		`SELECT `+userColumns+` FROM users WHERE username ILIKE $1 OR about ILIKE $1 ORDER BY username LIMIT 30`,
		"%"+escapeLike(query)+"%",
	)
	if err != nil {
		logDatabaseError("search users", err)
		writeError(w, http.StatusInternalServerError, "Could not search users")
		return
	}
	defer rows.Close()
	results := make([]map[string]any, 0)
	for rows.Next() {
		var account user
		if err := rows.Scan(
			&account.ID, &account.Username, &account.Email, &account.ProfilePicture, &account.Banner,
			&account.About, &account.Pronouns, &account.Location, &account.Label, &account.Name,
		); err != nil {
			logDatabaseError("read user search result", err)
			writeError(w, http.StatusInternalServerError, "Could not search users")
			return
		}
		results = append(results, map[string]any{
			"id": account.ID, "username": account.Username, "bio": account.About,
			"avatarUrl": account.ProfilePicture,
		})
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate user search results", err)
		writeError(w, http.StatusInternalServerError, "Could not search users")
		return
	}
	writeJSON(w, http.StatusOK, results)
}

func formValue(r *http.Request, key, fallback string) string {
	if values, exists := r.MultipartForm.Value[key]; exists && len(values) > 0 {
		return strings.TrimSpace(values[0])
	}
	return fallback
}

func escapeLike(value string) string {
	return strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`).Replace(value)
}

func isUniqueViolation(err error) bool {
	var databaseError interface{ SQLState() string }
	return errors.As(err, &databaseError) && databaseError.SQLState() == "23505"
}

func logDatabaseError(action string, err error) {
	log.Printf("%s: %v", action, err)
}
