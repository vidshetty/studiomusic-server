package auth

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// TokenStore persists JWT tokens in a file (one entry per subject).
type TokenStore struct {
	path string
	mu   sync.RWMutex
}

// StoredTokens is the file format: map of subject (e.g. email) -> JWT.
type StoredTokens map[string]string

func NewTokenStore(path string) *TokenStore {
	return &TokenStore{path: path}
}

func (s *TokenStore) loadUnlocked() (StoredTokens, error) {
	data, err := os.ReadFile(s.path)
	if err != nil {
		if os.IsNotExist(err) {
			return make(StoredTokens), nil
		}
		return nil, err
	}
	var out StoredTokens
	if err := json.Unmarshal(data, &out); err != nil {
		return nil, err
	}
	if out == nil {
		out = make(StoredTokens)
	}
	return out, nil
}

func (s *TokenStore) saveUnlocked(tokens StoredTokens) error {
	dir := filepath.Dir(s.path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(tokens, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, data, 0600)
}

func (s *TokenStore) Load() (StoredTokens, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.loadUnlocked()
}

func (s *TokenStore) Save(tokens StoredTokens) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.saveUnlocked(tokens)
}

func (s *TokenStore) Put(subject, token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	tokens, err := s.loadUnlocked()
	if err != nil {
		return err
	}
	tokens[subject] = token
	return s.saveUnlocked(tokens)
}

func (s *TokenStore) Exists(token string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	tokens, err := s.loadUnlocked()
	if err != nil {
		return false, err
	}
	for _, t := range tokens {
		if t == token {
			return true, nil
		}
	}
	return false, nil
}
