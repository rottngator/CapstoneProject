package main

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type track struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Artist      string `json:"artist"`
	Description string `json:"description"`
	UserID      int64  `json:"userId"`
	CreatedAt   string `json:"createdAt"`
	AudioFile   string `json:"audioFile"`
	Path        string `json:"path"`
	CoverImage  string `json:"coverImageUrl"`
	Streams     int    `json:"streams"`
	Likes       int    `json:"likes"`
	Comments    int    `json:"comments"`
	IsFeatured  bool   `json:"isFeatured"`
}

func (a *application) uploadTrack(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, a.maxUpload)
	if err := r.ParseMultipartForm(2 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "File is too large or upload form is invalid")
		return
	}
	title := strings.TrimSpace(r.FormValue("title"))
	artist := strings.TrimSpace(r.FormValue("artist"))
	description := strings.TrimSpace(r.FormValue("description"))
	if title == "" || artist == "" {
		writeError(w, http.StatusBadRequest, "Title and artist are required")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "An audio file is required")
		return
	}
	defer file.Close()

	extension := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedAudioExtensions[extension] {
		writeError(w, http.StatusBadRequest, "Choose an MP3, WAV, OGG, M4A, AAC, FLAC, or WebM audio file")
		return
	}
	filename, err := randomFilename(extension)
	if err != nil {
		logDatabaseError("generate audio filename", err)
		writeError(w, http.StatusInternalServerError, "Could not store audio file")
		return
	}
	if err := a.writeUpload(filename, file); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	var createdID int64
	err = a.db.QueryRowContext(r.Context(), `
		INSERT INTO tracks (title, artist, description, audio_filename, user_id)
		VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		title, artist, description, filename, authenticatedUserID(r),
	).Scan(&createdID)
	if err != nil {
		_ = os.Remove(filepath.Join(a.uploadDir, filename))
		logDatabaseError("save track metadata", err)
		writeError(w, http.StatusInternalServerError, "Could not save track")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"id": createdID, "fileUrl": fmt.Sprintf("/files/%d", createdID)})
}

func (a *application) writeUpload(filename string, source io.Reader) error {
	destination := filepath.Join(a.uploadDir, filename)
	file, err := os.OpenFile(destination, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o640)
	if err != nil {
		logDatabaseError("create upload file", err)
		return errors.New("Could not save uploaded file")
	}
	written, copyErr := io.Copy(file, io.LimitReader(source, a.maxUpload+1))
	closeErr := file.Close()
	if copyErr != nil {
		_ = os.Remove(destination)
		logDatabaseError("write upload file", copyErr)
		return errors.New("Could not save uploaded file")
	}
	if closeErr != nil {
		_ = os.Remove(destination)
		logDatabaseError("close upload file", closeErr)
		return errors.New("Could not save uploaded file")
	}
	if written > a.maxUpload {
		_ = os.Remove(destination)
		return errors.New("File exceeds the 10 MB limit")
	}
	return nil
}

var allowedAudioExtensions = map[string]bool{
	".mp3": true, ".wav": true, ".ogg": true, ".m4a": true,
	".aac": true, ".flac": true, ".webm": true,
}

var allowedImageExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
}

func (a *application) saveOptionalImage(r *http.Request, field string) (string, error) {
	file, header, err := r.FormFile(field)
	if errors.Is(err, http.ErrMissingFile) {
		return "", nil
	}
	if err != nil {
		return "", errors.New("Could not read uploaded image")
	}
	defer file.Close()
	extension := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExtensions[extension] {
		return "", errors.New("Profile images must be JPG, PNG, GIF, or WebP")
	}
	filename, err := randomFilename(extension)
	if err != nil {
		logDatabaseError("generate profile image filename", err)
		return "", errors.New("Could not store profile image")
	}
	if err := a.writeUpload(filename, file); err != nil {
		return "", err
	}
	return filename, nil
}

func (a *application) recentTracks(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT id, title, artist, description, user_id, audio_filename,
		created_at::text, is_featured
		FROM tracks ORDER BY created_at DESC LIMIT 20`)
	if err != nil {
		logDatabaseError("load recent tracks", err)
		writeError(w, http.StatusInternalServerError, "Could not load recent tracks")
		return
	}
	defer rows.Close()
	tracks := make([]track, 0)
	for rows.Next() {
		var item track
		if err := rows.Scan(
			&item.ID, &item.Title, &item.Artist, &item.Description, &item.UserID,
			&item.AudioFile, &item.CreatedAt, &item.IsFeatured,
		); err != nil {
			logDatabaseError("read recent track", err)
			writeError(w, http.StatusInternalServerError, "Could not load recent tracks")
			return
		}
		item.Path = fmt.Sprintf("/files/%d", item.ID)
		item.CoverImage = "/images/track.jpg"
		tracks = append(tracks, item)
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate recent tracks", err)
		writeError(w, http.StatusInternalServerError, "Could not load recent tracks")
		return
	}
	writeJSON(w, http.StatusOK, tracks)
}

func (a *application) userTracks(w http.ResponseWriter, r *http.Request) {
	rows, err := a.db.QueryContext(r.Context(), `
		SELECT id, title, artist, description, user_id, audio_filename,
		created_at::text, is_featured
		FROM tracks WHERE user_id = $1 ORDER BY created_at DESC`, authenticatedUserID(r))
	if err != nil {
		logDatabaseError("load user tracks", err)
		writeError(w, http.StatusInternalServerError, "Could not load tracks")
		return
	}
	defer rows.Close()
	tracks := make([]track, 0)
	for rows.Next() {
		var item track
		if err := rows.Scan(
			&item.ID, &item.Title, &item.Artist, &item.Description, &item.UserID,
			&item.AudioFile, &item.CreatedAt, &item.IsFeatured,
		); err != nil {
			logDatabaseError("read user track", err)
			writeError(w, http.StatusInternalServerError, "Could not load tracks")
			return
		}
		item.Path = fmt.Sprintf("/files/%d", item.ID)
		item.CoverImage = "/images/track.jpg"
		tracks = append(tracks, item)
	}
	if err := rows.Err(); err != nil {
		logDatabaseError("iterate user tracks", err)
		writeError(w, http.StatusInternalServerError, "Could not load tracks")
		return
	}
	writeJSON(w, http.StatusOK, tracks)
}

func (a *application) featuredTrack(w http.ResponseWriter, r *http.Request) {
	item, err := a.getTrack(r, `WHERE is_featured = TRUE`)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "No featured track found")
		return
	}
	if err != nil {
		logDatabaseError("load featured track", err)
		writeError(w, http.StatusInternalServerError, "Could not load featured track")
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (a *application) getTrack(r *http.Request, condition string, args ...any) (track, error) {
	var item track
	query := `SELECT id, title, artist, description, user_id, audio_filename,
		created_at::text, is_featured FROM tracks ` + condition
	err := a.db.QueryRowContext(r.Context(), query, args...).Scan(
		&item.ID, &item.Title, &item.Artist, &item.Description, &item.UserID,
		&item.AudioFile, &item.CreatedAt, &item.IsFeatured,
	)
	item.Path = fmt.Sprintf("/files/%d", item.ID)
	item.CoverImage = "/images/track.jpg"
	return item, err
}

func (a *application) featureTrack(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		logDatabaseError("begin feature track transaction", err)
		writeError(w, http.StatusInternalServerError, "Could not feature track")
		return
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(r.Context(), `UPDATE tracks SET is_featured = FALSE`); err != nil {
		logDatabaseError("clear featured track", err)
		writeError(w, http.StatusInternalServerError, "Could not feature track")
		return
	}
	result, err := tx.ExecContext(r.Context(),
		`UPDATE tracks SET is_featured = TRUE WHERE id = $1 AND user_id = $2`,
		id, authenticatedUserID(r),
	)
	if err != nil {
		logDatabaseError("feature track", err)
		writeError(w, http.StatusInternalServerError, "Could not feature track")
		return
	}
	updated, err := result.RowsAffected()
	if err != nil {
		logDatabaseError("check featured track update", err)
		writeError(w, http.StatusInternalServerError, "Could not feature track")
		return
	}
	if updated == 0 {
		writeError(w, http.StatusNotFound, "Track not found")
		return
	}
	if err := tx.Commit(); err != nil {
		logDatabaseError("commit featured track update", err)
		writeError(w, http.StatusInternalServerError, "Could not feature track")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Track featured successfully"})
}

func (a *application) serveTrack(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var filename string
	err := a.db.QueryRowContext(r.Context(), `SELECT audio_filename FROM tracks WHERE id=$1`, id).Scan(&filename)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Track not found")
		return
	}
	if err != nil {
		logDatabaseError("find audio file", err)
		writeError(w, http.StatusInternalServerError, "Could not load audio file")
		return
	}
	filePath := filepath.Join(a.uploadDir, filepath.Base(filename))
	file, err := os.Open(filePath)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			writeError(w, http.StatusNotFound, "Audio file not found")
			return
		}
		logDatabaseError("open audio file", err)
		writeError(w, http.StatusInternalServerError, "Could not load audio file")
		return
	}
	defer file.Close()
	if contentType := mime.TypeByExtension(filepath.Ext(filename)); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}
	http.ServeContent(w, r, filepath.Base(filename), zeroTime, file)
}

func (a *application) deleteTrack(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var filename string
	err := a.db.QueryRowContext(r.Context(),
		`DELETE FROM tracks WHERE id=$1 AND user_id=$2 RETURNING audio_filename`,
		id, authenticatedUserID(r),
	).Scan(&filename)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "Track not found")
		return
	}
	if err != nil {
		logDatabaseError("delete track", err)
		writeError(w, http.StatusInternalServerError, "Could not delete track")
		return
	}
	if err := os.Remove(filepath.Join(a.uploadDir, filepath.Base(filename))); err != nil && !errors.Is(err, os.ErrNotExist) {
		logDatabaseError("remove track file", err)
		writeError(w, http.StatusInternalServerError, "Track metadata was deleted, but its audio file could not be removed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "File deleted successfully"})
}

var zeroTime = time.Time{}
