package main

import (
	"net/http"
	"strings"
)

type chatMessage struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Message   string `json:"message"`
	CreatedAt string `json:"createdAt"`
}

func (a *application) listChatMessages(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT chat_messages.id, users.username, chat_messages.message, chat_messages.created_at::text
		FROM chat_messages JOIN users ON users.id = chat_messages.user_id
		ORDER BY chat_messages.id DESC LIMIT 100`)
	if err != nil {
		logDatabaseError("load community messages", err)
		writeError(w, http.StatusInternalServerError, "Could not load community messages")
		return
	}
	defer rows.Close()
	messages := make([]chatMessage, 0)
	for rows.Next() {
		var item chatMessage
		if err := rows.Scan(&item.ID, &item.Username, &item.Message, &item.CreatedAt); err != nil {
			logDatabaseError("read community message", err)
			writeError(w, http.StatusInternalServerError, "Could not load community messages")
			return
		}
		messages = append(messages, item)
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate community messages", err)
		writeError(w, http.StatusInternalServerError, "Could not load community messages")
		return
	}
	for left, right := 0, len(messages)-1; left < right; left, right = left+1, right-1 {
		messages[left], messages[right] = messages[right], messages[left]
	}
	writeJSON(w, http.StatusOK, messages)
}

func (a *application) createChatMessage(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Message string `json:"message"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Message = strings.TrimSpace(input.Message)
	if input.Message == "" || len(input.Message) > 1000 {
		writeError(w, http.StatusBadRequest, "Message must be between 1 and 1000 characters")
		return
	}
	var result chatMessage
	err := a.db.QueryRowContext(r.Context(), `
		INSERT INTO chat_messages (user_id, message) VALUES ($1, $2)
		RETURNING id, (SELECT username FROM users WHERE id=$1), message, created_at::text`,
		authenticatedUserID(r), input.Message,
	).Scan(&result.ID, &result.Username, &result.Message, &result.CreatedAt)
	if err != nil {
		logDatabaseError("create community message", err)
		writeError(w, http.StatusInternalServerError, "Could not send message")
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (a *application) createFeedback(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Message string `json:"message"`
	}
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Message = strings.TrimSpace(input.Message)
	if input.Message == "" || len(input.Message) > 4000 {
		writeError(w, http.StatusBadRequest, "Feedback must be between 1 and 4000 characters")
		return
	}
	if _, err := a.db.ExecContext(r.Context(),
		`INSERT INTO feedback (user_id, message) VALUES ($1, $2)`,
		authenticatedUserID(r), input.Message,
	); err != nil {
		logDatabaseError("save feedback", err)
		writeError(w, http.StatusInternalServerError, "Could not submit feedback")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"message": "Thanks for sharing your feedback."})
}
