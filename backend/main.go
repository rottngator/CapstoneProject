package main

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

//go:embed migrations/001_initial.sql
var migrationFiles embed.FS

type application struct {
	db        *sql.DB
	jwtSecret []byte
	uploadDir string
	frontend  string
	maxUpload int64
}

func main() {
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	jwtSecret := os.Getenv("JWT_SECRET")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	if len(jwtSecret) < 32 {
		log.Fatal("JWT_SECRET must be set to at least 32 characters")
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = filepath.Join("public", "uploads")
	}
	if err := os.MkdirAll(uploadDir, 0o750); err != nil {
		log.Fatalf("create upload directory: %v", err)
	}

	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatalf("open PostgreSQL connection: %v", err)
	}
	defer db.Close()
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("connect to PostgreSQL: %v", err)
	}
	if err := migrate(ctx, db); err != nil {
		log.Fatalf("apply database migrations: %v", err)
	}

	frontend := os.Getenv("FRONTEND_ORIGIN")
	if frontend == "" {
		frontend = "http://localhost:3001"
	}
	app := &application{
		db:        db,
		jwtSecret: []byte(jwtSecret),
		uploadDir: uploadDir,
		frontend:  frontend,
		maxUpload: 10 << 20,
	}
	server := &http.Server{
		Addr:              envOr("ADDR", ":3000"),
		Handler:           app.routes(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      2 * time.Minute,
		IdleTimeout:       60 * time.Second,
	}

	log.Printf("Sound Hub API listening on %s", server.Addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("start HTTP server: %v", err)
	}
}

func migrate(ctx context.Context, db *sql.DB) error {
	schema, err := migrationFiles.ReadFile("migrations/001_initial.sql")
	if err != nil {
		return fmt.Errorf("read schema: %w", err)
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin schema migration: %w", err)
	}
	defer tx.Rollback()
	for _, statement := range strings.Split(string(schema), ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("execute schema statement: %w", err)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit schema migration: %w", err)
	}
	return nil
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}
