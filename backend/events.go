package main

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
	"time"
)

type event struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
	Time        string `json:"time"`
	Date        string `json:"date"`
	UserID      int64  `json:"userId"`
}

type eventRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Location    string `json:"location"`
	Time        string `json:"time"`
	Date        string `json:"date"`
}

const eventColumns = `id, title, description, location, event_time, event_date::text, user_id`

func (a *application) createEvent(w http.ResponseWriter, r *http.Request) {
	var input eventRequest
	if !decodeJSON(w, r, &input) {
		return
	}
	if err := validateEvent(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	created, err := a.db.QueryContext(r.Context(), `
		INSERT INTO events (title, description, location, event_time, event_date, user_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+eventColumns,
		strings.TrimSpace(input.Title), strings.TrimSpace(input.Description),
		strings.TrimSpace(input.Location), input.Time, input.Date, authenticatedUserID(r),
	)
	if err != nil {
		logDatabaseError("create event", err)
		writeError(w, http.StatusInternalServerError, "Could not create event")
		return
	}
	defer created.Close()
	if !created.Next() {
		if err := created.Err(); err != nil {
			logDatabaseError("read created event", err)
		}
		writeError(w, http.StatusInternalServerError, "Could not create event")
		return
	}
	result, err := scanEvent(created)
	if err != nil {
		logDatabaseError("scan created event", err)
		writeError(w, http.StatusInternalServerError, "Could not create event")
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (a *application) listEvents(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(),
		`SELECT `+eventColumns+` FROM events ORDER BY event_date, event_time LIMIT 100`,
	)
	if err != nil {
		logDatabaseError("list events", err)
		writeError(w, http.StatusInternalServerError, "Could not load events")
		return
	}
	defer rows.Close()
	results := make([]event, 0)
	for rows.Next() {
		result, err := scanEvent(rows)
		if err != nil {
			logDatabaseError("read event", err)
			writeError(w, http.StatusInternalServerError, "Could not load events")
			return
		}
		results = append(results, result)
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate events", err)
		writeError(w, http.StatusInternalServerError, "Could not load events")
		return
	}
	writeJSON(w, http.StatusOK, results)
}

func (a *application) getEvent(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	result, err := a.loadEvent(r, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Event not found")
		return
	}
	if err != nil {
		logDatabaseError("load event", err)
		writeError(w, http.StatusInternalServerError, "Could not load event")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (a *application) updateEvent(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var input eventRequest
	if !decodeJSON(w, r, &input) {
		return
	}
	if err := validateEvent(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	updated, err := a.db.QueryContext(r.Context(), `
		UPDATE events SET title=$1, description=$2, location=$3, event_time=$4, event_date=$5
		WHERE id=$6 AND user_id=$7 RETURNING `+eventColumns,
		strings.TrimSpace(input.Title), strings.TrimSpace(input.Description),
		strings.TrimSpace(input.Location), input.Time, input.Date,
		id, authenticatedUserID(r),
	)
	if err != nil {
		logDatabaseError("update event", err)
		writeError(w, http.StatusInternalServerError, "Could not update event")
		return
	}
	defer updated.Close()
	if !updated.Next() {
		writeError(w, http.StatusNotFound, "Event not found")
		return
	}
	result, err := scanEvent(updated)
	if err != nil {
		logDatabaseError("read updated event", err)
		writeError(w, http.StatusInternalServerError, "Could not update event")
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (a *application) deleteEvent(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	result, err := a.db.ExecContext(r.Context(),
		`DELETE FROM events WHERE id=$1 AND user_id=$2`, id, authenticatedUserID(r),
	)
	if err != nil {
		logDatabaseError("delete event", err)
		writeError(w, http.StatusInternalServerError, "Could not delete event")
		return
	}
	deleted, err := result.RowsAffected()
	if err != nil {
		logDatabaseError("check deleted event", err)
		writeError(w, http.StatusInternalServerError, "Could not delete event")
		return
	}
	if deleted == 0 {
		writeError(w, http.StatusNotFound, "Event not found")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Event deleted successfully"})
}

func (a *application) loadEvent(r *http.Request, id int64) (event, error) {
	var result event
	err := a.db.QueryRowContext(r.Context(),
		`SELECT `+eventColumns+` FROM events WHERE id=$1`, id,
	).Scan(&result.ID, &result.Title, &result.Description, &result.Location,
		&result.Time, &result.Date, &result.UserID)
	return result, err
}

func scanEvent(row interface{ Scan(...any) error }) (event, error) {
	var result event
	err := row.Scan(&result.ID, &result.Title, &result.Description, &result.Location,
		&result.Time, &result.Date, &result.UserID)
	return result, err
}

func validateEvent(input eventRequest) error {
	if strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Location) == "" ||
		strings.TrimSpace(input.Time) == "" || strings.TrimSpace(input.Date) == "" {
		return errors.New("Title, location, time, and date are required")
	}
	if len(input.Title) > 160 || len(input.Location) > 160 || len(input.Description) > 4000 {
		return errors.New("Event details are too long")
	}
	if _, err := time.Parse("2006-01-02", input.Date); err != nil {
		return errors.New("Date must use YYYY-MM-DD format")
	}
	if _, err := time.Parse("15:04", input.Time); err != nil {
		if _, secondErr := time.Parse("3:04 PM", input.Time); secondErr != nil {
			return errors.New("Time must use HH:MM format")
		}
	}
	return nil
}
