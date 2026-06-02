package middlewares

import (
	"server_go/services/auth"

	"github.com/gin-gonic/gin"
)

// Auth validates the request using JWT (from cookie or Authorization header).
// The JWT must be valid and present in the file-based token store.
func Auth(c *gin.Context) {
	auth.ValidateJWT(c)
}

// AuthRedirectToLogin validates JWT; if invalid, redirects to /login (for dashboard pages).
func AuthRedirectToLogin(c *gin.Context) {
	auth.ValidateJWTOrRedirectToLogin(c)
}

// AuthOrThrowError validates JWT; if invalid, throws error.
func AuthOrThrowError(c *gin.Context) {
	auth.ValidateJWTOrThrowError(c)
}
