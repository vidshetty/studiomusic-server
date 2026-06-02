package mainrouter

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func serveDashboardAsset(filename string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cwd, _ := os.Getwd()
		path := filepath.Join(cwd, "dashboard", filename)

		switch strings.ToLower(filepath.Ext(filename)) {
		case ".svg":
			c.Header("Content-Type", "image/svg+xml")
		case ".png":
			c.Header("Content-Type", "image/png")
		case ".css":
			c.Header("Content-Type", "text/css; charset=utf-8")
		case ".js":
			c.Header("Content-Type", "application/javascript; charset=utf-8")
		}

		c.File(path)
	}
}
