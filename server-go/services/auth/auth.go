package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	envhandler "server_go/services/env_handler"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const (
	cookieName   = "dashboard_jwt"
	cookiePath   = "/"
	allowedEmail = "toriumcar@gmail.com"
)

// tokenStoreInterface allows swapping file vs in-memory store.
type tokenStoreInterface interface {
	Put(subject, token string) error
	Exists(token string) (bool, error)
	Load() (StoredTokens, error)
	Save(tokens StoredTokens) error
}

// memoryStore holds JWT tokens in memory (subject -> token).
type memoryStore struct {
	mu     sync.RWMutex
	tokens map[string]string
}

func newMemoryStore() *memoryStore {
	return &memoryStore{tokens: make(map[string]string)}
}

func (s *memoryStore) Put(subject, token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.tokens == nil {
		s.tokens = make(map[string]string)
	}
	s.tokens[subject] = token
	return nil
}

func (s *memoryStore) Exists(token string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, t := range s.tokens {
		if t == token {
			return true, nil
		}
	}
	return false, nil
}

func (s *memoryStore) Load() (StoredTokens, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make(StoredTokens, len(s.tokens))
	for k, v := range s.tokens {
		out[k] = v
	}
	return out, nil
}

func (s *memoryStore) Save(tokens StoredTokens) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if tokens == nil {
		s.tokens = make(map[string]string)
	} else {
		s.tokens = make(map[string]string, len(tokens))
		for k, v := range tokens {
			s.tokens[k] = v
		}
	}
	return nil
}

var (
	oauth2Config *oauth2.Config
	tokenStore   tokenStoreInterface
	jwtSecret    []byte
)

// Claims for our JWT (subject = email from Google).
type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func Init() error {
	e := envhandler.GetEnv()
	jwtSecret = []byte(e.JWTSecret)
	if len(jwtSecret) == 0 {
		return fmt.Errorf("JWT_SECRET is required")
	}
	oauth2Config = &oauth2.Config{
		ClientID:     e.GoogleClientID,
		ClientSecret: e.GoogleClientSecret,
		RedirectURL:  e.AuthRedirectURL,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
	tokenStore = newMemoryStore()
	return nil
}

// RedirectToGoogle redirects the client to Google's OAuth consent page.
func RedirectToGoogle(c *gin.Context) {
	state := envhandler.GetEnv().AuthState
	if state == "" {
		state = "studiomusic-dashboard"
	}
	url := oauth2Config.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.SetAuthURLParam("prompt", "consent"))
	c.Redirect(http.StatusFound, url)
}

// HandleGoogleCallback exchanges the code for tokens, fetches user info, issues JWT, stores in file, sets cookie.
func HandleGoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	state := c.Query("state")
	expectedState := envhandler.GetEnv().AuthState
	if expectedState == "" {
		expectedState = "studiomusic-dashboard"
	}
	if state != expectedState {
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	ctx := context.Background()
	tok, err := oauth2Config.Exchange(ctx, code)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	client := oauth2Config.Client(ctx, tok)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil || resp.StatusCode != http.StatusOK {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	defer resp.Body.Close()

	var user struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	if user.Email == "" {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	if user.Email != allowedEmail {
		c.Redirect(http.StatusFound, "/dashboard/auth/unauthorized")
		c.Abort()
		return
	}

	claims := &Claims{
		Email: user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.Email,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour * 7)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	if err := tokenStore.Put(user.Email, tokenString); err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	// Set HTTP-only cookie so the browser sends it on same-origin requests
	c.SetCookie(cookieName, tokenString, 7*24*3600, cookiePath, "", envhandler.GetEnv().Environment == envhandler.Enviroment_Production, true)
	// Redirect to dashboard
	c.Redirect(http.StatusFound, "/dashboard")
}

func wantsJSONResponse(c *gin.Context) bool {
	if c.GetHeader("X-Dashboard-Request") != "" {
		return true
	}
	return strings.Contains(c.GetHeader("Accept"), "application/json")
}

func abortUnauthorized(c *gin.Context) {
	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
}

func respondUnauthorized(c *gin.Context) {
	if wantsJSONResponse(c) {
		abortUnauthorized(c)
		return
	}
	c.Redirect(http.StatusFound, "/dashboard/login")
	c.Abort()
}

// ValidateJWT reads the JWT from cookie (or Authorization header), verifies it, and checks file store.
func ValidateJWT(c *gin.Context) {
	tokenString := extractToken(c)
	if tokenString == "" {
		abortUnauthorized(c)
		return
	}
	claims, ok := parseAndValidateToken(tokenString)
	if !ok {
		abortUnauthorized(c)
		return
	}
	c.Set("email", claims.Email)
	c.Next()
}

// ValidateJWTOrRedirectToLogin validates JWT; if invalid, redirects to /login (for dashboard HTML).
func ValidateJWTOrRedirectToLogin(c *gin.Context) {
	tokenString := extractToken(c)
	if tokenString == "" {
		respondUnauthorized(c)
		return
	}
	claims, ok := parseAndValidateToken(tokenString)
	if !ok {
		respondUnauthorized(c)
		return
	}
	c.Set("email", claims.Email)
	c.Next()
}

// ValidateJWTOrThrowError validates JWT; if invalid, throws error.
func ValidateJWTOrThrowError(c *gin.Context) {
	tokenString := extractToken(c)
	if tokenString == "" {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	claims, ok := parseAndValidateToken(tokenString)
	if !ok {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	c.Set("email", claims.Email)
	c.Next()
}

func extractToken(c *gin.Context) string {
	tokenString := c.GetHeader("Authorization")
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}
	if tokenString == "" {
		tokenString, _ = c.Cookie(cookieName)
	}
	return tokenString
}

func parseAndValidateToken(tokenString string) (*Claims, bool) {
	claims := &Claims{}
	tok, err := jwt.ParseWithClaims(tokenString, claims, func(*jwt.Token) (interface{}, error) { return jwtSecret, nil })
	if err != nil || !tok.Valid {
		return nil, false
	}
	ok, err := tokenStore.Exists(tokenString)
	if err != nil || !ok {
		return nil, false
	}
	return claims, true
}

// Logout clears the cookie and optionally removes token from file.
func Logout(c *gin.Context) {
	tokenString, _ := c.Cookie(cookieName)
	if tokenString != "" {
		// Remove this token from file by reloading, deleting matching token, saving
		tokens, _ := tokenStore.Load()
		for sub, t := range tokens {
			if t == tokenString {
				delete(tokens, sub)
				_ = tokenStore.Save(tokens)
				break
			}
		}
	}
	c.SetCookie(cookieName, "", -1, cookiePath, "", false, true)
	c.Redirect(http.StatusFound, "/dashboard/login")
}
